import React, {useEffect, useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import {
    ListItemAvatar,
    Avatar,
    Fab,
    ListItemText,
    ListSubheader,
    ListItem,
    List
} from '@material-ui/core';
import {AddOutlined} from "@material-ui/icons";
import {useEvents} from "../hooks/useEvents";
import {Redirect, useHistory} from "react-router-dom";
import {DropzoneArea} from "material-ui-dropzone";

const useStyles = makeStyles((theme) => ({
    list: {
        flex: 1,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto'
    },
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
    },
    listSection: {
        backgroundColor: 'inherit',
    },
    ul: {
        backgroundColor: 'inherit',
        padding: 0,
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    }
}));

function Events()
{
    const classes = useStyles();
    const history = useHistory();
    const {events, newEvent, uploadCoverPhoto} = useEvents();
    const [redirect, setRedirect] = useState(null);

    useEffect(() => {
        if (redirect !== null) {
            history.push(`events/${redirect}`);
        }
    }, [redirect])

    const listContent = [];
    let i = 0;
    for (let monthDate in events) {
        if (!events.hasOwnProperty(monthDate)) {
            continue;
        }

        listContent.push(
            <li key={`section-${i}`} className={classes.listSection}>
                <ul className={classes.ul}>
                    <ListSubheader>{monthDate}</ListSubheader>
                    {events[monthDate].map((event, index) => (
                        <ListItem key={`item-${i}-${index}`} onClick={() => {
                            setRedirect(event.id);
                        }}>
                            <ListItemAvatar>
                                <Avatar>
                                    {event.date.format('D')}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={event.title} />
                        </ListItem>
                    ))}
                </ul>
            </li>
        );

        i++;
    }

    return (
        <>
            <div className={classes.list}>
                <List className={classes.root} subheader={<li />}>
                    <DropzoneArea
                        onChange={(files) => {
                            if (files.length > 0) {
                                uploadCoverPhoto(files[0]);
                            }
                        }}
                        onDelete={() => {
                            //clearFile();
                        }}
                        filesLimit={1}
                        showAlerts={false}
                    />
                    {listContent}
                </List>
                <Fab color="primary" aria-label="add" className={classes.fab} onClick={async () => {
                    const event = await newEvent();
                    setRedirect(event.id);
                }}>
                    <AddOutlined />
                </Fab>
            </div>
        </>
    );
}

export default Events;