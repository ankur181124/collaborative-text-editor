import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Editor = () => {
  const reactQuillRef = useRef(null);

  useEffect(() => {
    // Create a Yjs document
    const ydoc = new Y.Doc();

    // Set up WebSocket connection using WebsocketProvider
    const provider = new WebsocketProvider("ws://localhost:1234", "shared-room", ydoc);

    // Get the shared Y.Text instance
    const ytext = ydoc.getText("quill");

    // Bind Y.Text to the Quill editor
    if (reactQuillRef.current) {
      const quill = reactQuillRef.current.getEditor();
      new QuillBinding(ytext, quill);
    }

    // Cleanup on unmount
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <ReactQuill
      ref={reactQuillRef}
      theme="snow"
      modules={modules}
      placeholder="Start collaborating..."
    />
  );
};

export default Editor;
