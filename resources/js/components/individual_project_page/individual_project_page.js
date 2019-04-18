import React from 'react'
import { Link } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Modal from 'react-responsive-modal';
import {cloneDeep} from 'lodash';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

class Projects_list_page extends React.Component {

    constructor(props) {
        super(props);
        this.updatedRows = new Set();
        this.state = { // state is initialized to just have two column definitions, and no row data.
            // the column definitions and row data are actually updated in compoundDidMount()
            openTypeWarning : false,
            openNoScheduleWarning: false,
            columnDefs: [{
                headerName: "Name", field: "name" // headerName is the name of the column, field is what is
                // referenced by row data. For instance, to create a row for these two column defs, you would do
                // [{"name" : Jonathan Ou}, {"role": "Product Manager"}]
            }, {
                headerName: "Role", field: "role"
            }],
            rowData: []
        }
    }

    /***
     * Processes
     * @param data
     * @returns {{rowData: Array, columnDefs: []}}
     */
    async processData(data) {
        console.log(data);
        let columnDefs = [
            {headerName: 'Name', field: 'name', sortable: true},
            {headerName: 'NetID', field: 'netid', sortable:true},
            {headerName: 'Role', field: 'role', sortable:true, enableCellChangeFlash: true},
        ];
        let rowData = [];
        let columnNames = new Set();
        let prevNetID = null;
        let currentJSON = {};

        for (let i = 0; i < data.length; i++) {
            let currentSchedule = data[i];
            let currentNetID = currentSchedule.NetID;
            let currentHeader = currentSchedule.Dates;
            let fullName = currentSchedule.FirstName + " " + currentSchedule.LastName;

            if (currentNetID != prevNetID) {
                if (prevNetID != null) {
                    rowData.push(currentJSON);
                }

                let currentRole = currentSchedule.Role;
                prevNetID = currentNetID;
                currentJSON = {netid: currentNetID, name : fullName, role: currentRole};
            }

            let currentHours = currentSchedule.HoursPerWeek;

            if (!columnNames.has(currentHeader)) {
                columnNames.add(currentHeader);
                let newColumnDef = {
                    headerName: currentHeader,
                    field: currentHeader,
                    sortable: true,
                    enableCellChangeFlash: true,
                    editable: true
                };
                columnDefs.push(newColumnDef);
            }

            currentJSON[currentHeader] = currentHours;
        }

        rowData.push(currentJSON);
        let dates = columnDefs.slice(3);
        let dateComparator = function(a,b) {
            if (a.field < b.field) {
                return -1;
            }
            if (a.field > b.field) {
                return 1;
            }
            return 0;
        };
        dates.sort(dateComparator);
        columnDefs = columnDefs.slice(0,3).concat(dates);
        return {"rowData" : rowData, "columnDefs" : columnDefs};
    }

    /***
     * This function is always called right after the constructor for this class is called
     * It makes a GET request to the api (argument to the fetch function), retrieves it, then processes the data
     * using processData to create new row data and column definitions, and then updates the state to those values.
     * That is why when you load this page, it starts off empty and then data populates the grid.
     * It is called once, immediately after render() is first called
     */
    componentDidMount() {
        let projectID = this.props.match.params.projectID;
        fetch(`../api/displayResourceInfoPerProject/${projectID}`)
            .then(result => result.json())
            .then(data => this.processData(data))
            .then(function(newStuff) {
                this.setState({rowData: newStuff["rowData"], columnDefs: newStuff["columnDefs"]})
                    }.bind(this))
    }

    /***
     * Makes API call to update all the edited rows prior to this call
     * Clears the edited rows so we don't save the same information twice
     */
    async saveData() {
        console.log("Saving Data");
        let data = this.state.rowData;
        let updatedRows = this.updatedRows;
        let projectID = this.props.match.params.projectID;

        // index is the index of a row that has been updated

        let processData = async function (pair) {
            let index = pair["rowIndex"];
            let key = pair["colIndex"];
            let netID = data[index]["netid"];
            let hours = data[index][key];
            let newData = {
                "ProjectID": projectID,
                "NetID": netID,
                "Dates": key,
                "HoursPerWeek": hours
            };
            console.log(newData);
            let response = await fetch('../api/updateSchedule', {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            });
            console.log(response);
        }
        updatedRows.forEach(processData);
        this.updatedRows.clear();
    }

    /***
     * Restores the row data to the last saved row data
     */
    restoreData() {
        console.log(this);
    }

    closeTypeWarningModal() {
        this.setState({openTypeWarning: false});
    }

    /***
     * Add the row index of the row that was just edited
     * @param event
     */
    addUpdatedRow(event) {
        console.log("SUP");
        let numericalInput = Number(event.value);
        let editedColumn = event.colDef.field;
        if (isNaN(numericalInput)) {
            this.setState({openTypeWarning:true})
            return;
        }
        this.updatedRows.add({"rowIndex" : event.rowIndex, "colIndex" : editedColumn});
    }


    canEditCell(event) {
        if (event.value == undefined) {
            this.setState({"openNoScheduleWarning":true});
            return;
        }
    }

    closeNoScheduleWarningModal() {
        this.setState({openNoScheduleWarning: false});
    }

    submit() {
        confirmAlert({
            title: 'Confirm To Save',
            message: 'Are you sure to do this?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.saveData()
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true
        });
    };

    async addOneWeek() {

    }
    /***
     * Makes POST Request to save data
     */
    /*** This is what you see on the screen
     *
     * @returns {*}
     */
    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{
                    height: '65vh',
                    width: '100vw'
                }}
            >
                <Modal open={this.state.openTypeWarning} onClose = {this.closeTypeWarningModal.bind(this)} center closeIconSize = {14}>
                    <h3 style = {{marginTop:'15px'}}>Please Enter An Integer</h3>
                </Modal>

                <Modal open={this.state.openNoScheduleWarning} onClose = {this.closeNoScheduleWarningModal.bind(this)} center closeIconSize = {14}>
                    <h3 style = {{marginTop:'15px'}}>Resource Did Not Work This Week</h3>
                </Modal>

                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onCellValueChanged = {this.addUpdatedRow.bind(this)}
                    onCellClicked = {this.canEditCell.bind(this)}
                    suppressHorizontalScroll = {true}
                >
                </AgGridReact>

                <button style = {{height:'30px',width:'100px',marginRight: '10px'}}
                        onClick = {
                            this.submit.bind(this)
                        }
                >
                    Save
                </button>
                <button style = {{height:'30px',width:'100px', marginRight: '10px'}}
                        onClick = {this.restoreData.bind(this)
                        }
                >
                    Cancel
                </button>
                <button style = {{height:'30px',width:'100px'}} onClick = {() => console.log("hello")}>Add One Week</button>
            </div>
        );
    }
}

export default Projects_list_page