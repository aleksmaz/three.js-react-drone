import React from "react";
import ReactDOM from "react-dom";
import ThreeScene from "./Component/ThreeScene";
import PanelComponent from "./Component/PanelComponent";

function App() {
    return (
        <div
            className="App"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >

            <PanelComponent/>
            <ThreeScene />



        </div>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


