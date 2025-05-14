import React, { Component } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';

class EditWorkersPage extends Component {
    static contextType = AppDataContext;

    constructor(props) {
        super(props);
        this.state = {
            selectedWorker: null,
            selectedAbilities: [],
        };
    }

    handleWorkerChange = (selectedOption) => {
        const { workers } = this.context;
        const worker = workers.find(w => w.username === selectedOption.value);
        this.setState({
            selectedWorker: selectedOption,
            selectedAbilities: worker?.abilities || [],
        });
    };

    handleAbilitiesChange = (selectedOptions) => {
        const abilities = selectedOptions.map(option => option.value);
        this.setState({ selectedAbilities: abilities });
    };

    handleSave = () => {
        const { selectedWorker, selectedAbilities } = this.state;
        const { workers, setWorkers } = this.context;

        const updated = workers.map(w =>
            w.username === selectedWorker.value
                ? { ...w, abilities: selectedAbilities }
                : w
        );

        setWorkers(updated);
        alert('היכולות עודכנו בהצלחה!');

        // איפוס הטופס
        this.setState({
            selectedWorker: null,
            selectedAbilities: [],
        });
    };

    render() {
        const { workers, abilities } = this.context;
        const { selectedWorker, selectedAbilities } = this.state;

        const workerOptions = workers.map(w => ({
            value: w.username,
            label: w.username,
        }));

        const abilityOptions = abilities.map(a => ({
            value: a,
            label: a,
        }));

        return (
            <div style={{ padding: '2rem' }} dir="rtl">
                <h3>עריכת יכולות עובדים</h3>

                <div className="mb-3">
                    <label>בחר עובד:</label>
                    <Select
                        options={workerOptions}
                        value={selectedWorker}
                        onChange={this.handleWorkerChange}
                        placeholder="בחר עובד..."
                    />
                </div>

                {selectedWorker && (
                    <>
                        <div className="mb-3">
                            <label>בחר יכולות לעובד:</label>
                            <Select
                                options={abilityOptions}
                                isMulti
                                value={abilityOptions.filter(a => selectedAbilities.includes(a.value))}
                                onChange={this.handleAbilitiesChange}
                                placeholder="בחר יכולות..."
                            />
                        </div>

                        <button className="btn btn-primary" onClick={this.handleSave}>
                            שמור שינויים
                        </button>
                    </>
                )}
            </div>
        );
    }
}

export default EditWorkersPage;
