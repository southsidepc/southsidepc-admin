import {useEffect, useState} from "react";
import moment from "moment";
import firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import firebaseConfig from "../firebase-config";
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const storage = firebase.storage();

function useEvents() {
    const [events, setEvents] = useState({});
    const [eventCount, setEventCount] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);

    useEffect(() => {
        return firestore.collection('events').orderBy('date', 'desc').onSnapshot((snapshot) => {
            const snapshotEvents = {};

            snapshot.docs.map(documentSnapshot => {
                const event = documentSnapshot.data();
                if (event.hasOwnProperty('date') && event.date != null) {
                    event.date = moment(event.date);
                } else {
                    event.date = moment().startOf('day');
                }

                const monthYear = event.date.format('MMMM YYYY');

                if (!snapshotEvents.hasOwnProperty(monthYear)) {
                    snapshotEvents[monthYear] = [];
                }

                snapshotEvents[monthYear].push(event);
                event.id = documentSnapshot.id;

                return event;
            });

            setEventCount(snapshot.docs.length + 1);

            setEvents(snapshotEvents);
        });
    }, []);

    const newEvent = async () => {
        const event =  await firestore.collection('events').add({
            title: `Event ${eventCount}`,
            date: moment().startOf('day').format(),
            content: '',
            link: '',
            updated: false,
            published: false,
            image: '',
            imageName: ''
        });

        return event;
    };

    const uploadCoverPhoto = async photo => {
        let test = await firestore.collection('coverPhoto').limitToFirst(1).get();
        let doc = test.docs[0].ref;

        if(typeof photo.name !== 'string') {
            return;
        }
        const uploadTask = storage.ref(`/coverPhotos/${photo.name}`).put(photo);

        setIsUploading(true);

        uploadTask.on('state_changed',
            (snapShot) => {
                setUploadPercent(snapShot.bytesTransferred / snapShot.totalBytes * 100);
            }, (err) => {
                const cover = {image: "", imageName: ""};
                doc.update(cover);
                setIsUploading(false);
                setUploadPercent(0);
            }, async () => {
                setIsUploading(false);
                setUploadPercent(0);
                const fireBaseUrl = storage.ref(`coverPhotos`).child(photo.name).getDownloadURL();
                const cover = {image: fireBaseUrl, imageName: photo.name};
                await doc.update(cover);
            })
    };

    return {events, isUploading, uploadPercent, uploadCoverPhoto, newEvent};
}

function useEvent(id) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [initialLoad, setInitialLoad] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);

    const getEventAsync = async () => {
        try {
            setLoading(true);
            const doc = await firestore.collection('events').doc(id).get();
            const eventData = doc.data();
            if (eventData == null) {
                setInvalid(true);
            } else {
                if (eventData.hasOwnProperty('date') && eventData.date != null) {
                    eventData.date = moment(eventData.date).toDate();
                }
                if (eventData.imageName != null && eventData.imageName !== '') {
                    eventData.image = await storage.ref(`events/${id}`).child(eventData.imageName).getDownloadURL();
                }
                setEvent(eventData);
            }
        } catch (e) {
            console.log(e);
            setInvalid(true);
        }
        setLoading(false);
        setInitialLoad(true);
    };

    useEffect(() => {
        getEventAsync().then();
    }, [id]);

    const updateEvent = async (event) => {
        setLoading(true);
        event.date = moment(event.date).startOf('day').format();
        await firestore.collection('events').doc(id).update(event);
        await getEventAsync();
        setLoading(false);
    };

    const deleteEvent = async () => {
        setLoading(true);
        await firestore.collection('events').doc(id).delete();
        setLoading(false);
        setInvalid(true);
    };

    const uploadFile = file => {
        if(typeof file.name !== 'string') {
            return;
        }
        const uploadTask = storage.ref(`/events/${id}/${file.name}`).put(file);

        setIsUploading(true);

        uploadTask.on('state_changed',
            (snapShot) => {
                setUploadPercent(snapShot.bytesTransferred / snapShot.totalBytes * 100);
            }, (err) => {
                const imageEvent = {...event, image: "", imageName: ""};
                updateEvent(imageEvent).then(() => {
                    setEvent(imageEvent);
                });
                setIsUploading(false);
                setUploadPercent(0);
            }, () => {
                setIsUploading(false);
                setUploadPercent(0);
                storage.ref(`events/${id}`).child(file.name).getDownloadURL()
                    .then(fireBaseUrl => {
                        const imageEvent = {...event, image: fireBaseUrl, imageName: file.name};
                        updateEvent(imageEvent).then(() => {
                            setEvent(imageEvent);
                        });
                    })
            })
    }

    const clearFile = () => {
        const imageEvent = {...event, image: "", imageName: ""};
        updateEvent(imageEvent).then(() => {
            setEvent(imageEvent);
        });
    }

    const publish = async (notification = false) => {
        const eventClone = {...event, date: moment(event.date).startOf('day').format(), published: true};
        setLoading(true);
        await firestore.collection('events').doc(id).update(eventClone);
        await getEventAsync();
        if (notification !== false) {
            await notify(notification);
        }
        setLoading(false);
    }

    const notify = async (notification) => {
        setLoading(true);
        await firestore.collection('events').doc(id).collection('notifications').add(notification);
        setLoading(false);
    }

    return {event, loading, invalid, initialLoad, isUploading, uploadPercent, updateEvent, deleteEvent, uploadFile, clearFile, publish, notify};
}

export {useEvents, useEvent};