import React, { Component } from 'react';
import ReactList from 'react-list';
import { Link } from 'react-router-dom'
import Modal from 'react-responsive-modal';

class Individual_resource_page extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            oldNetID: "",
            netID: "",
            hours: 0,
            projects: "",
            openEdit: false,

        };
        this.renderItem = this.renderItem.bind(this);
    }

    componentDidMount() {
        fetch('/api/displayProjectsPerResource/' + this.props.match.params.resourceID)
            .then(res => res.json())
            .then(
                (result) => {
                    // let string_result = JSON.stringify({ result })
                    // console.log(result);
                    this.setState({ projects: result });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    return <h2>failed</h2>;
                });

        fetch('/api/displayResourceInfo/' + this.props.match.params.resourceID)
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log(result)
                    this.setState({
                        firstName: result[0].FirstName,
                        lastName: result[0].LastName,
                        oldNetID: result[0].NetID,
                        netID: result[0].NetID,
                        hours: result[0].MaxHoursPerWeek
                    })
                    console.log(result);

                },
                (error) => {
                    return <h2>failed</h2>;
                });
    }

    closeEditModal() {
        this.setState({ openEdit: false });
    }
    openEditModal() {
        this.setState({ openEdit: true });
    }
    //TODO: handle HTTP PUT call
    async handleSubmit(event) {
        let data = {
            "OldNetID": this.state.oldNetID,
            "NetID": this.state.netID,
            "FirstName": this.state.firstName,
            "LastName": this.state.lastName,
            "MaxHoursPerWeek": this.state.hours
        }

        console.log("handleSubmit called");
        let response = await fetch('../api/updateResource', {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        console.log(response);

    }
    handleChange(inputID, event) {
        // console.log(inputID);
        // this.setState({ value: event.target.value.toUpperCase() });
    }




    // renders each individual row of the projects list.
    renderItem(index, key) {
        if (this.state.projects.length != 0) {
            return (
                <div key={key} style={{ borderStyle: 'solid' }}>
                    <div>{this.state.projects[index].ProjectName}</div>
                    <div>Start Date: {this.state.projects[index].StartDate}</div>
                </div >
            );
        }
        else {
            return <div></div>;
        }
    }
    // handleSubmit(event) {
    //     alert('submitted: ');
    //     event.preventDefault();
    // }


    render() {
        return (
            <div>
                <Modal open={this.state.openEdit} onClose={this.closeEditModal.bind(this)} center closeIconSize={14}>
                    <h4 style={{ marginTop: '15px' }}>Resource Information</h4>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <label style={{ marginRight: '15px' }}>
                            First Name:
                        </label>
                        <input style={{ float: 'right' }} type="text" id="firstName" defaultValue={this.state.firstName} onChange={this.handleChange(this.id)} />
                        <br></br>

                        <label style={{ marginRight: '15px' }}>
                            Last Name:
                        </label>

                        <input style={{ float: 'right' }} type="text" id="lastName" defaultValue={this.state.lastName} onChange={this.handleChange(this.id)} />
                        <br></br>

                        <label style={{ marginRight: '15px' }}>
                            netID:
                        </label>
                        <input style={{ float: 'right' }} type="text" id="netID" defaultValue={this.state.netID} onChange={this.handleChange(this.id)} />
                        <br></br>

                        <label style={{ marginRight: '15px' }}>
                            Max hours per Week:
                        </label>

                        <input style={{ float: 'right' }} type="text" id="maxHours" defaultValue={this.state.hours} onChange={this.handleChange(this.id)} />
                        <br></br>
                        <input type="submit" value="Submit" />
                    </form>

                </Modal>

                <div style={{ overflow: 'auto', width: '50%', float: 'left' }}>
                    <h1>Resource name: {this.state.firstName} {this.state.lastName}</h1>
                    <button type='button' onClick={this.openEditModal.bind(this)}>Edit Resource</button>
                </div>
                <div style={{ overflow: 'auto', maxHeight: 200, width: '50%', float: 'right' }}>
                    <ReactList
                        itemRenderer={this.renderItem}
                        length={this.state.projects.length}
                        type='uniform'
                    />
                </div >
            </div >
        );
    }
}



export default Individual_resource_page
