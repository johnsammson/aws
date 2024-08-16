import { useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";
import axios from "axios";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [output, setOutput] = useState("");
  const [boiler, setBoiler] = useState("//Go Crazy lad")

  const submitCode = async (data) => {
    try {
      const response = await axios.post(
        "http://13.127.133.97:5000/api/submissions",
        {
          code: data,
          language: language,
        }
      );
      setOutput(response.data);
    } catch (error) {
      console.error("Error submitting code:", error);
      setOutput("An error occurred while processing your code.");
    }
  };

  return (
    <>
      <div>
        <div>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>
        <button
          style={{
            background: language === "cpp" ? "black" : "white",
            color: language === "cpp" ? "white" : "black",
          }}
          onClick={() => {
            setLanguage("cpp");
            setBoiler("//Go Crazy lads")
          }}
        >
          cpp
        </button>
        <button
          style={{
            background: language === "python" ? "black" : "white",
            color: language === "python" ? "white" : "black",
          }}
          onClick={() => {
            setLanguage("python");
            setBoiler("#Go Crazy lads")
          }}
        >
          python
        </button>
        <button
          style={{
            background: language === "java" ? "black" : "white",
            color: language === "java" ? "white" : "black",
          }}
          onClick={() => {
            setLanguage("java");
            setBoiler("//Go Crazy lads")
          }}
        >
          java
        </button>
        <hr />
        <button onClick={() => submitCode(code)}>Submit</button>
        <Editor
          onChange={(e) => {
            setCode(e);
          }}
          value={code}
          height="90vh"
          theme="vs-dark"
          defaultLanguage={language}
          
        />
      </div>
    </>
  );
}

export default App;
