import React from 'react';
import './index.css';

function TimeTableRow(props) {
    console.log(`quantity ${props.quantity}`);
    return (
        <tr className="product-table-row" onClick={props.onClick}>
            <td>{props.row.date}</td>
            <td>{props.row.startTime}</td>
            <td>{props.row.endTime}</td>
        </tr>
    );
  }

class TimeSlot extends React.Component {
    state = {
        timeslots:
            [
                {
                    date: "23.03.2020",
                    startTime: "8:00",
                    endTime: "8:30"
                },
                {
                    date: "23.03.2020",
                    startTime: "8:30",
                    endTime: "9:00"
                }
            ]
    }

    render() {
        const {timeslots} = this.state;
        let timeslotsTable;
        if (timeslots) {
            timeslotsTable = timeslots.map(row => {
              return (
                <TimeTableRow
                  row={row}
                  key={row.id}
                  onClick={() => this.props.bookTime()}
                />
              );
            });
          }
        return (
            <div>
                <h1>Zeitfenster</h1>
                {timeslots &&
                <table>
                    <thead>
                    <tr>
                        <td>Datum</td>
                        <td>Anfangszeit</td>
                        <td>Endzeit</td>
                    </tr>
                    </thead>
                    <tbody>
                    {timeslotsTable}
                    </tbody>
                </table>
                }
            </div>
        );
    }
}

export default TimeSlot;