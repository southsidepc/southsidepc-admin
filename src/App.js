import React from 'react';
import {
    BrowserRouter as Router,
} from "react-router-dom";
import SouthsideSwitch from "./SouthsideSwitch";
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

export default function App() {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Router>
                <SouthsideSwitch/>
            </Router>
        </MuiPickersUtilsProvider>
    );
}