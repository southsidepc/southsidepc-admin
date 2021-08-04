import React, {useEffect, useRef, useState} from "react";
import {useParams, useHistory} from 'react-router-dom';
import {
    Button,
    TextField,
    LinearProgress
} from "@material-ui/core";
import {
    KeyboardDatePicker,
} from '@material-ui/pickers';
import {makeStyles} from "@material-ui/core/styles";
import { DropzoneArea } from 'material-ui-dropzone';
import {useEvent} from "../hooks/useEvents";
import moment from "moment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        padding: '2rem',
    },
     content: {
         maxWidth: '1000px',
         display: 'flex',
         flexDirection: 'column',
         margin: '0 auto'
     },
    title: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    flex: {
        flex: 1
    },
    divider: {
        padding: '0.5rem'
    },
    contentFlex: {
        display: 'flex',
        flexDirection: 'column'
    },
    buttonContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    saveContainer: {
        display: 'flex'
    },
    popupTitle: {
        marginBottom: '1rem'
    }
}));

function EventEditor() {
    const params = useParams();
    const history = useHistory();
    const classes = useStyles();
    const {event, loading, invalid, initialLoad, isUploading, uploadPercent, updateEvent, deleteEvent, uploadFile, clearFile, publish, notify} = useEvent(params.id);
    const saveTimer = useRef();

    useEffect(() => {
        if (invalid) {
            history.replace('/');
        }
    }, [invalid]);

    const [title, setTitle] = useState(event != null && event.hasOwnProperty('title') && event.title != null ? event.title : "");
    const [date, setDate] = React.useState(event != null && event.hasOwnProperty('date') && event.date != null ? event.date : Date());
    const [content, setContent] = useState(event != null && event.hasOwnProperty('content') && event.content != null ? event.content : "");
    const [link, setLink] = useState(event != null && event.hasOwnProperty('link') && event.link != null ? event.link : "");
    const [openPublish, setOpenPublish] = useState(false);
    const [openReminder, setOpenReminder] = useState(false);
    const [notification, setNotification] = useState({
        checked: false,
        title: "",
        body: "",
    });

    useEffect(() => {
        if (saveTimer.current == null) {
            setTitle(event != null && event.hasOwnProperty('title') && event.title != null ? event.title : "");
            setDate(event != null && event.hasOwnProperty('date') && event.date != null ? event.date : Date());
            setContent(event != null && event.hasOwnProperty('content') && event.content != null ? event.content : "");
            setLink(event != null && event.hasOwnProperty('link') && event.link != null ? event.link : "");
        }
    }, [event]);

    const doUpdate = () => {
        updateEvent({...event, title, date, content, link, updated: true}).then();
    }

    useEffect(() => {
        return () => {
            if (event != null) {
                //TODO fix for deleting before routing occurs
                if (!event.updated && saveTimer.current == null) {
                    deleteEvent().then();
                }

                if (saveTimer.current != null) {
                    doUpdate();
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!initialLoad) {
            return;
        }

        if (saveTimer.current != null) {
            clearTimeout(saveTimer.current);
            saveTimer.current = null;
        }

        saveTimer.current = setTimeout(() => {
            doUpdate();
            saveTimer.current = null;
        }, 3000);
    }, [title, moment(date).format(), content, link]);

    console.log(event);

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {
                    event == null ?
                    null :
                    <DropzoneArea
                        onChange={(files) => {
                            if (files.length > 0 && event.imageName === '') {
                                uploadFile(files[0]);
                            }
                        }}
                        onDelete={() => {
                            clearFile();
                        }}
                        filesLimit={1}
                        initialFiles={event.image !== '' ? [event.image] : []}
                        showAlerts={false}
                    />
                }
                {
                    isUploading ?
                        (
                            <>
                                <div className={classes.divider}/>
                                <LinearProgress variant="determinate" value={uploadPercent}/>
                            </>
                        )
                    :
                    null
                }
                <div className={classes.divider}/>
                <div className={classes.title}>
                    <TextField
                        label="Title"
                        variant="outlined"
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value);
                        }}
                        classes={{
                            root: classes.flex
                        }}
                    />
                    <div className={classes.divider}/>
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="d MMM yyyy"
                        label="Date"
                        inputVariant="outlined"
                        value={date}
                        onChange={(date) => {
                            setDate(date);
                        }}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        classes={{
                            root: classes.flex
                        }}
                    />
                </div>
                <div className={classes.divider}/>
                <div className={classes.contentFlex}>
                    <TextField
                        label="Content"
                        multiline
                        variant="outlined"
                        value={content}
                        onChange={(event) => {
                            setContent(event.target.value);
                        }}
                    />
                </div>
                <div className={classes.divider}/>
                <div className={classes.contentFlex}>
                    <TextField
                        label="Link"
                        variant="outlined"
                        value={link}
                        onChange={(event) => {
                            setLink(event.target.value);
                        }}
                    />
                </div>
                <div className={classes.divider}/>
                <div className={classes.buttonContainer}>
                    <Button
                        disabled={loading}
                        variant="contained"
                        color="secondary"
                        onClick={async () =>
                        {
                            if (saveTimer.current != null) {
                                clearTimeout(saveTimer.current);
                                saveTimer.current = null;
                            }

                            await deleteEvent();
                        }}
                    >
                        Delete
                    </Button>
                    <div className={classes.divider}/>
                    <div className={classes.saveContainer}>
                        <Button
                            disabled={loading}
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                            {
                                if (saveTimer.current != null) {
                                    clearTimeout(saveTimer.current);
                                    saveTimer.current = null;
                                }

                                doUpdate();
                            }}
                        >
                            Save
                        </Button>
                        <div className={classes.divider}/>
                        {
                            event?.published ?
                            <Button
                                disabled={loading}
                                variant="outlined"
                                color="primary"
                                onClick={() =>
                                {
                                    setNotification({checked: true, title: title, body: content ? (content.length <= 100 ? content : content.substring(0, 97) + '...') : ''});
                                    setOpenReminder(true);
                                }}
                            >
                                Reminder
                            </Button> :
                            <Button
                                disabled={loading}
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                {
                                    setNotification({checked: true, title: title, body: content ? (content.length <= 100 ? content : content.substring(0, 97) + '...') : ''});
                                    setOpenPublish(true);
                                }}
                            >
                                Publish
                            </Button>
                        }
                    </div>
                </div>
            </div>
            <Dialog
                open={openPublish}
                onClose={() => {
                    setOpenPublish(false);
                }}
            >
                <DialogTitle>Publish</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you wish to publish this event?
                    </DialogContentText>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={notification.checked}
                                onChange={(event, checked) => {
                                    setNotification(previous => ({...previous, checked}));
                                }}
                                name="checked"
                                color="primary"
                            />
                        }
                        label="Send Notification?"
                    />
                    <TextField
                        label="Title"
                        fullWidth
                        onChange={(event) => {
                            const notificationClone = {...notification, title: event.target.value};
                            setNotification(notificationClone);
                        }}
                        value={notification.title}
                        disabled={!notification.checked}
                        variant="outlined"
                        classes={{
                            root: classes.popupTitle
                        }}
                    />
                    <TextField
                        label="Body"
                        fullWidth
                        multiline
                        onChange={(event) => {
                            const notificationClone = {...notification, body: event.target.value};
                            setNotification(notificationClone);
                        }}
                        value={notification.body}
                        disabled={!notification.checked}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenPublish(false);
                        }}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        setOpenPublish(false);
                        if (notification.checked)
                        {
                            publish({title: notification.title, body: notification.body}).then();
                        }
                        else
                        {
                            publish().then();
                        }
                    }} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openReminder}
                onClose={() => {
                    setOpenReminder(false);
                }}
            >
                <DialogTitle>Publish</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        fullWidth
                        onChange={(event) => {
                            const notificationClone = {...notification, title: event.target.value};
                            setNotification(notificationClone);
                        }}
                        value={notification.title}
                        variant="outlined"
                        classes={{
                            root: classes.popupTitle
                        }}
                    />
                    <TextField
                        label="Body"
                        fullWidth
                        multiline
                        onChange={(event) => {
                            const notificationClone = {...notification, body: event.target.value};
                            setNotification(notificationClone);
                        }}
                        value={notification.body}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenReminder(false);
                        }}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        setOpenReminder(false);
                        notify({title: notification.title, body: notification.body});
                    }} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default EventEditor;