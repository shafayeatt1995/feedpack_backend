const express = require("express");
const mongoose = require("mongoose");
const { Paddle, EventName } = require("@paddle/paddle-node-sdk");
const { User, Subscription } = require("../models");
const app = express();

const paddle = new Paddle(process.env.PADDLE_API_KEY);

app.post(
  "/subscription",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const signature = req.headers["paddle-signature"] || "";
    const rawRequestBody = req.body.toString();
    const secretKey = process.env.PADDLE_WEBHOOK_SUBSCRIPTION_SECRET || "";

    try {
      if (signature && rawRequestBody) {
        const eventData = await paddle.webhooks.unmarshal(
          rawRequestBody,
          secretKey,
          signature
        );
        switch (eventData.eventType) {
          case "subscription.activated":
            console.log("====================", eventData);
            const { id, status, customData, items, nextBilledAt } =
              eventData?.data;
            if (customData && status === "active") {
              console.log("====================", eventData.data);
              const { userID, package } = customData;
              const { amount } = items[0].price.unitPrice;
              const [val1, val2] = await Promise.all(
                await Subscription.create(
                  [
                    {
                      userID,
                      transactionID: id,
                      package,
                      amount: amount / 100,
                    },
                  ],
                  { session }
                ),
                await User.updateOne(
                  { _id: userID },
                  {
                    power:
                      package === "basicMonth" || package === "basicYear"
                        ? 10
                        : package === "premiumMonth" ||
                          package === "premiumYear" ||
                          package === "oneTime"
                        ? 20
                        : 1,
                    subscription: "Active",
                    expDate: new Date(nextBilledAt),
                  },
                  { session }
                )
              );
            }
            break;
          default:
        }
      }
      await session.commitTransaction();
      await session.endSession();
      res.send("Processed webhook event completed");
    } catch (e) {
      console.error(e);
      await session.abortTransaction();
      await session.endSession();
      res.status(500).send("Failed to processed webhook event");
    }
  }
);

app.post(
  "/otp",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const signature = req.headers["paddle-signature"] || "";
    const rawRequestBody = req.body.toString();
    const secretKey = process.env.PADDLE_WEBHOOK_OTP_SECRET || "";

    try {
      if (signature && rawRequestBody) {
        const eventData = await paddle.webhooks.unmarshal(
          rawRequestBody,
          secretKey,
          signature
        );
        switch (eventData.eventType) {
          case EventName.TransactionCompleted:
            const { id, status, customData, payments } = eventData?.data;
            if (customData && status === "completed") {
              const { user, popupr_pac } = customData;
              const { amount, methodDetails } = payments[0];
              // await Promise.all(
              //   await Subscription.create(
              //     [
              //       {
              //         userID: user._id,
              //         transactionID: id,
              //         paymentDetails: methodDetails,
              //         package: popupr_pac,
              //         amount: amount / 100,
              //       },
              //     ],
              //     { session }
              //   ),
              //   await User.updateOne(
              //     { _id: user._id },
              //     {
              //       power:
              //         popupr_pac === "main_course"
              //           ? 20
              //           : popupr_pac === "appetizer"
              //           ? 10
              //           : 1,
              //     },
              //     { session }
              //   )
              // );
            }
            break;
          default:
        }
      }
      await session.commitTransaction();
      await session.endSession();
      res.send("Processed webhook event");
    } catch (e) {
      console.error(e);
      await session.abortTransaction();
      await session.endSession();
      res.status(500).send("Failed to processed webhook event");
    }
  }
);

module.exports = app;
