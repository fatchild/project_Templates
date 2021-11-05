import React from "react";


function Thing(props){
    return(
        <div>
            <h2>Hi {props.name}!</h2>
            <p>
                This is a thing. A thing that exists inside a file called Thing. Really, this is a Thing.
            </p>
        </div>
    );
}

export default Thing;