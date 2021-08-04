
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp();

// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.firestore.document('events/{eventId}/notifications/{notificationId}').onCreate(
    async (snapshot) => {
        // Notification details.
        const eventId = snapshot.ref.parent.parent.id;
        const notification = snapshot.data();
        const message = {
            notification,
            topic: "events",
            data: {
                eventId,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            }
        };

        return admin.messaging().send(message);
    });