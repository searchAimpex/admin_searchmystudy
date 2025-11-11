import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function TextEditor({content,setContent}) {

 console.log(content);
 
// console.log(content);

  return (
    <div>
      
      <Editor
        apiKey="163byk4swq6r7cb7olxy06pn0z4nge2nc1fwiza52a77ay88"
        value={content}
        init={{
          height: 300,
          menubar: false,
          plugins: ["link", "image", "lists", "table", "code"],
          toolbar:
            "undo redo | formatselect | bold italic | " +
            "alignleft aligncenter alignright | bullist numlist | link image | code",
        }}
        onEditorChange={(newContent) => setContent(newContent)}
      />      
    </div>
  );
}
