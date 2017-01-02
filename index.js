const React = require("react");
const FlatButton = require("material-ui/FlatButton");
const TextField = require("material-ui/TextField");
const SelectField = require("material-ui/SelectField");
const MenuItem = require("material-ui/MenuItem");
const FontIcon = require('material-ui/FontIcon');
const $ = require("jquery");

module.exports = class MuiEditableTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rowData: [],
            colSpec: [],
            reorderable: false,
            onChange: function() {
            }
        };

        this.onFieldChange = this.onFieldChange.bind(this);
        this.onAddRow = this.onAddRow.bind(this);
        this.onDeleteRow = this.onDeleteRow.bind(this);
        this.onReorderRow = this.onReorderRow.bind(this);
    }

    componentDidMount() {
        this.setState(
            {
                rowData: $.extend(true, [], this.props.rowData),
                colSpec: this.props.colSpec,
                reorderable: this.props.reorderable || false,
                onChange: this.props.onChange
            }
        );
    }

    render() {
        return (
            <div className="container">
                <div className="mui-editable-table">
                    {this.renderHeader()}

                    {this.state.rowData.map((dataRow, i) => (
                        this.renderRow(dataRow, i)
                    ))}
                    <input
                        type="hidden"
                        id="mui-editable-table-count"
                        ref="mui-editable-table-count"
                        value={this.state.rowData.length}
                        readOnly="readOnly"
                    />
                </div>
            </div>
        )
    }

    renderHeader() {
        return (
            <div className="mui-editable-table-row header-row">
                {this.state.colSpec.map((col) => (
                    <div
                        className={"row-cell header-cell " + col.fieldName}
                        key={col.fieldName}
                        style={{width: col.width}}
                    >
                        {col.title}
                    </div>
                ))}
                <div className={"row-cell header-cell action"} style={{width: "100px"}}>
                    {this.iconButton('', 'add', this.onAddRow(), 'add')}
                </div>
            </div>
        )
    }

    renderRow(dataRow, index) {
        return (
            <div className="mui-editable-table-row">
                {this.state.colSpec.map((col) => (
                    <div
                        className={"cell " + col.fieldName}
                        key={col.fieldName + index}
                        style={{width: col.width}}
                    >
                        {this.renderInputField(col, index, dataRow)}
                    </div>
                ))}
                {this.renderRowButtons(index)}
            </div>
        )
    }

    renderInputField(column, index, rowData) {
        if (column.inputType === "TextField") {
            return (
                <TextField
                    ref={column.fieldName + index}
                    id={column.fieldName + index}
                    style={{width: column.width}}
                    value={column.fieldName in rowData ? rowData[column.fieldName] : ''}
                    disabled={column.isDisabled ? column.isDisabled(rowData) : false}
                    onChange={this.onFieldChange(index, column.fieldName)}
                />
            )
        } else if (column.inputType === "SelectField") {
            return (
                <SelectField
                    ref={column.fieldName + index}
                    id={column.fieldName + index}
                    style={{width: column.width}}
                    value={column.fieldName in rowData ? rowData[column.fieldName] : ''}
                    disabled={column.isDisabled ? column.isDisabled(rowData) : false}
                    onChange={this.onFieldChange(index, column.fieldName)}
                >
                    {column.selectOptions.map((option) => (
                        this.createSelectOption(option)
                    ))}
                </SelectField>
            )
        }
        throw new Error("Input field type " + column.inputType + " not supported");
    }

    createSelectOption(option) {
        const key = option.key ? option.key : option;
        const value = option.value ? option.value : option;

        return (<MenuItem value={value} primaryText={value} key={key}/>);
    }

    renderRowButtons(index) {
        let buttons = [
            this.iconButton(index, 'delete', this.onDeleteRow(index), 'clear')
        ];

        if (this.state.reorderable) {
            if (index < (this.state.rowData.length - 1) && this.state.rowData.length > 1) {
                buttons.push(
                    this.iconButton(index, 'demote', this.onReorderRow(index, +1), 'keyboard arrow up')
                )
            }
            if (index > 0) {
                buttons.push(
                    this.iconButton(index, 'promote', this.onReorderRow(index, -1), 'keyboard arrow down')
                )
            }
        }

        return (
            <div>
                {buttons}
            </div>
        )
    }

    iconButton(rowKey, action, clickEvent, muiIconName) {
        return (
            <div className="cell action" key={"action" + action + rowKey} style={{width: "45px", display: "inline"}}>

                <FlatButton
                    className={"action-button " + action + "-row-button" + rowKey}
                    primary={true}
                    onClick={clickEvent}
                    style={{minWidth: "45px"}}
                    icon={<FontIcon className="material-icons">{muiIconName}</FontIcon>}
                />
            </div>
        )
    }

    onAddRow() {
        const self = this;
        return function() {
            let tempDataRow = $.extend(true, [], self.state.rowData);

            let newRow = {};
            self.state.colSpec.map((column) => (
                newRow[column.fieldName] = column.defaultValue || ''
            ));

            tempDataRow.push(newRow);

            self.setState({rowData: tempDataRow});
            self.state.onChange(tempDataRow)
        }
    }

    onDeleteRow(rowId) {
        const self = this;
        return function() {
            let tempDataRow = $.extend(true, [], self.state.rowData);

            tempDataRow.splice(rowId, 1);

            self.setState({rowData: tempDataRow});
            self.state.onChange(tempDataRow)
        }
    }

    onReorderRow(rowId, direction) {
        const self = this;
        return function() {
            let tempDataRow = $.extend(true, [], self.state.rowData);

            let oldIndex = rowId;
            let newIndex = rowId + direction;

            tempDataRow.splice(newIndex, 0, tempDataRow.splice(oldIndex, 1)[0]);

            self.setState({rowData: tempDataRow});
            self.state.onChange(tempDataRow)
        }
    }

    onFieldChange(rowId, fieldName) {
        const self = this;
        return function(event, textFieldValue, selectFieldValue) {
            let newValue = selectFieldValue ? selectFieldValue : textFieldValue;
            let tempDataRow = $.extend(true, [], self.state.rowData);

            tempDataRow[rowId][fieldName] = newValue;

            self.setState({rowData: tempDataRow});
            self.state.onChange(tempDataRow)
        }
    }
}
