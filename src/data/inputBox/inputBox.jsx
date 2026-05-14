import React from "react";

class InputBox extends React.Component {
    constructor(props) {
        super(props);
        this.label = props.label;
    }

    render() {
        return(
            <input
                type="text"
                defaultValue=`${this.label}`

                className="bg-white w-10 px-2 py-1 rounded-full text-black outline-none"
            />
        )
    }
}