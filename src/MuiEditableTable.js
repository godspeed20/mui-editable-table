import React from "react";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/content/clear';
import PromoteIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import DemoteIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import $ from "jquery";

class MuiEditableTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rowData: [],
            colSpec: [],
            reorderable: false,
            onChange: function () {
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
        const editableTableStyle = {
            display: "flex",
            flexFlow: "column nowrap",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Roboto, sans-serif",
        };

        return (
            <div className="container">
                <div className="mui-editable-table" style={editableTableStyle}>
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
        const headerRowStyle = {
            width: "100%",
            display: "flex",
            flexFlow: "row nowrap",
            border: "0",
            height: "40px",
            color: "rgb(158, 158, 158)",
            fontSize: "12px",
            borderBottom: "1px solid #ccc",
            paddingTop: "10px"
        };

        return (
            <div className="mui-editable-table-row header-row" style={headerRowStyle}>
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
                    {this.iconButton('', 'add', this.onAddRow(), <AddIcon />)}
                </div>
            </div>
        )
    }

    renderRow(dataRow, index) {
        const dataRowStyle = {
            width: "100%",
            display: "flex",
            flexFlow: "row nowrap",
            border: "0",
            height: "40px",
            borderBottom: "1px solid rgb(224, 224, 224)"
        };

        return (
            <div className="mui-editable-table-row" key={index} style={dataRowStyle}>
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
        if (column.isDisabled && column.isDisabled(rowData)){
            return (<div style={{width: column.width}}>{column.fieldName in rowData ? rowData[column.fieldName] : ''}</div>)
        }

        if (column.inputType === "TextField") {
            return (
                <TextField
                    ref={column.fieldName + index}
                    id={column.fieldName + index}
                    style={{width: column.width}}
                    value={column.fieldName in rowData ? rowData[column.fieldName] : ''}
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
            this.iconButton(index, 'delete', this.onDeleteRow(index), <DeleteIcon />)
        ];

        if (this.state.reorderable) {
            if (index < (this.state.rowData.length - 1) && this.state.rowData.length > 1) {
                buttons.push(
                    this.iconButton(index, 'demote', this.onReorderRow(index, +1), <DemoteIcon  />)
                )
            }
            if (index > 0) {
                buttons.push(
                    this.iconButton(index, 'promote', this.onReorderRow(index, -1), <PromoteIcon/>)
                )
            }
        }

        return (
            <div>
                {buttons}
            </div>
        )
    }

    iconButton(rowKey, action, clickEvent, muiIcon) {
        return (
            <div className="cell action" key={"action" + action + rowKey} style={{width: "45px", display: "inline"}}>

                <FlatButton
                    className={"action-button " + action + "-row-button" + rowKey}
                    primary={true}
                    onClick={clickEvent}
                    style={{minWidth: "45px"}}
                    icon={muiIcon}
                />
            </div>
        )
    }

    onAddRow() {
        const self = this;
        return function () {
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
        return function () {
            let tempDataRow = $.extend(true, [], self.state.rowData);

            tempDataRow.splice(rowId, 1);

            self.setState({rowData: tempDataRow});
            self.state.onChange(tempDataRow)
        }
    }

    onReorderRow(rowId, direction) {
        const self = this;
        return function () {
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
        return function (event, textFieldValue, selectFieldValue) {
            let newValue = selectFieldValue ? selectFieldValue : textFieldValue;
            let tempDataRow = $.extend(true, [], self.state.rowData);

            tempDataRow[rowId][fieldName] = newValue;

            self.setState({rowData: tempDataRow});
            self.state.onChange(tempDataRow)
        }
    }
}

export default MuiEditableTable;