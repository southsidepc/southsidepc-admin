import React from 'react';
import clsx from "clsx";
import {makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {CalendarTodayOutlined, AnnouncementOutlined} from "@material-ui/icons";
import {
    Switch,
    Route,
    Redirect,
    Link,
    useLocation
} from "react-router-dom";
import Events from "./screens/Events";
import Announcements from "./screens/Announcements";
import EventEditor from "./screens/EventEditor";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerContainer: {
        overflow: 'auto',
    },
    content: {
        flexGrow: 1,
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
        //padding: theme.spacing(3),
    },
    selected: {
        color: theme.palette.primary.main
    }
}));

export default function SouthsideSwitch() {
    const classes = useStyles();
    const location = useLocation();

    let title = 'Events';

    return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            {title}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <Toolbar />
                    <div className={classes.drawerContainer}>
                        <List>
                            <ListItem button component={Link} to='/events' key={0}>
                                <ListItemIcon>
                                    <CalendarTodayOutlined color={location.pathname.indexOf('/events') !== - 1 ? 'primary' : 'inherit'}/>
                                </ListItemIcon>
                                <ListItemText primary='Events' className={location.pathname.indexOf('/events') !== - 1 ? classes.selected : ''} />
                            </ListItem>
                        </List>
                    </div>
                </Drawer>
                <main className={classes.content}>
                    <Toolbar />
                    <Switch>
                        <Route exact path="/events">
                            <Events />
                        </Route>
                        <Route path="/events/:id">
                            <EventEditor />
                        </Route>
                        <Route path="/">
                            <Redirect to="/events" />
                        </Route>
                    </Switch>
                </main>
            </div>
    );
}