const express = require("express");
const mongoose = require("mongoose");
const { Paddle } = require("@paddle/paddle-node-sdk");
const { User, Subscription } = require("../models");
const { addDate } = require("../utils");
const app = express();

const paddle = new Paddle(process.env.PADDLE_API_KEY);

app.post(
  "/subscription",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const signature = req.headers["paddle-signature"] || "";
      const rawRequestBody = req.body.toString();
      const secretKey = process.env.PADDLE_WEBHOOK_SUBSCRIPTION_SECRET || "";
      if (signature && rawRequestBody) {
        const eventData = await paddle.webhooks.unmarshal(
          rawRequestBody,
          secretKey,
          signature
        );
        switch (eventData.eventType) {
          case "transaction.completed":
            const {
              id,
              status,
              customData,
              payments,
              billingPeriod,
              createdAt,
            } = eventData?.data;
            if (customData && status === "completed") {
              const { userID, package } = customData;
              const { amount, methodDetails } = payments[0];
              await Promise.all(
                await Subscription.create(
                  [
                    {
                      userID,
                      package,
                      transactionID: id,
                      paymentDetails: methodDetails,
                      amount: (amount / 100).toFixed(2),
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
                    expDate: billingPeriod?.endsAt
                      ? addDate(billingPeriod?.endsAt, 1)
                      : addDate(36500, createdAt),
                  },
                  { session }
                )
              );
            }
            break;
          default:
            console.log("unknown event", eventData);
            break;
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

module.exports = app;
