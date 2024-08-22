import { useEffect, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";
import axios from "axios";
import Terminal from "./components/terminal";
import FileTree from "./components/Tree";
import socket from "./socket";
import { getFileMode } from "./utils/getFileMode";

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");

  const isSaved = selectedFileContent === code;

  useEffect(() => {
    getFileTree();
  }, []);


  useEffect(() => {
    if (!isSaved && code) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFile,
          content: code,
        });
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  useEffect(() => {
    setCode(selectedFileContent);
  }, [selectedFileContent]);


  

  const getFileTree = async (data) => {
    try {
      const response = await axios.get("http://localhost:9000/files");
      //console.log(response.data);

      setFileTree(response.data.tree);
    } catch (error) {
      console.error("Error submitting code:", error);
      setOutput("An error occurred while processing your code.");
    }
  };
  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(
      `http://localhost:9000/files/content?path=${selectedFile}`
    );
    const result = await response.json();
    setSelectedFileContent(result.content);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  return (
    <div>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files">
          <FileTree
            onSelect={(path) => {
              setSelectedFileContent("");
              setSelectedFile(path);
            }}
            tree={fileTree}
          />
          </div>
          <div className="editor">
            {selectedFile && <p>{selectedFile.replaceAll("/", ">")}</p>}
            <Editor
              onChange={(e) => {
                setCode(e);
              }}
              value={code}
              height="60vh"
              theme="vs-dark"
              defaultLanguage={getFileMode({ selectedFile })}

            />
          </div>
        </div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
