import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill";
import ReactQuill from "react-quill";
import mammoth from "mammoth"; // Convert .docx to HTML
import "react-quill/dist/quill.snow.css";
import "../App.css";

const Editor = () => {
  const reactQuillRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const username = `User-${Math.floor(Math.random() * 1000)}`;
  const userColor = "#33FF57";
  const [ydoc, setYdoc] = useState(null);

  // Initialize Yjs and WebSocketProvider
  useEffect(() => {
    const ydocInstance = new Y.Doc();
    setYdoc(ydocInstance);

    const provider = new WebsocketProvider("ws://localhost:1234", "shared-room", ydocInstance);
    const awareness = provider.awareness;
    awareness.setLocalStateField("user", { name: username, color: userColor });

    const ytext = ydocInstance.getText("quill");

    if (reactQuillRef.current) {
      const quill = reactQuillRef.current.getEditor();
      new QuillBinding(ytext, quill); // Bind Quill to Yjs
    }

    return () => {
      provider.destroy();
      ydocInstance.destroy();
    };
  }, []);

  // Handle file upload and convert .docx content to HTML
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".docx")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        try {
          // Convert the file to HTML using Mammoth
          const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer });

          console.log("Converted HTML:", html); // Debug the HTML content
          console.log("Messages:", messages); // Log warnings or messages from mammoth

          if (reactQuillRef.current) {
            const quill = reactQuillRef.current.getEditor();
            // Clear editor and insert the new HTML content
            quill.setContents([]); // Clear current content
            quill.clipboard.dangerouslyPasteHTML(0, html); // Insert HTML
          }
        } catch (err) {
          console.error("Error converting .docx file:", err);
          alert("Failed to load the .docx file. Please try again.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid .docx file.");
    }
  };

  return (
    <div className="editor-container">
      {/* File Upload Section */}
      <div className="file-upload" style={{ marginBottom: "10px" }}>
        <input type="file" accept=".docx" onChange={handleFileUpload} />
      </div>

      {/* Quill Text Editor */}
      <ReactQuill
        ref={reactQuillRef}
        theme="snow"
        placeholder="Start collaborating or upload a .docx file..."
      />
    </div>
  );
};

export default Editor;
