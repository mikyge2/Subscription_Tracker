import dayjs from 'dayjs'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from '../models/subsciption.model.js';
import { sendReminderEmail } from '../utils/send-email.js'

const REMINDERS = [7, 5, 2, 1]

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if(!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);

    if(renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        const now = dayjs();

        if(reminderDate.isAfter(now)) {
            // Future reminder - sleep until that date
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
            // Send reminder after waking up
            await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
        } else if (now.isSame(reminderDate, 'day')) {
            // Reminder is today - send it now
            await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
        }
        // If reminderDate is in the past (not today), skip it
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendReminderEmail({
            to: "michaelgetuk@yahoo.com",
            type: label,
            subscription,
        })
    })
}