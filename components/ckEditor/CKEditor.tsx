/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
 

import {
  ClassicEditor,
  Autoformat,
  Bold,
  Italic,
  Underline,
  BlockQuote,
  Base64UploadAdapter,
  CloudServices,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
  Indent,
  IndentBlock,
  Link,
  List,
  Font,
  FontSize,
  FontFamily,
  Alignment,
  Mention,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  TextTransformation,
  SourceEditing,
  Code,
  CodeBlock,
  Highlight,
  HorizontalLine,
  MediaEmbed,
  RemoveFormat,
  SpecialCharacters,
  Strikethrough,
  Subscript,
  Superscript,
  WordCount,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./style.css";

interface CkEditorProps {
  editorData: string;
  handleOnUpdate: (value: string) => void;
  config?: {
    language?: string;
    direction?: "rtl" | "ltr";
    placeholder?: string;
  };
}

const CkEditor: FC<CkEditorProps> = ({
  editorData,
  handleOnUpdate,
  config,
}) => {
  /* ✅ STABLE CONFIG (VERY IMPORTANT) */
  const editorConfig = useMemo<any>(
    () => ({
      licenseKey: "GPL",
      language: config?.language ?? "en",
      placeholder: config?.placeholder ?? "",
      plugins: [
        Autoformat,
        BlockQuote,
        Bold,
        CloudServices,
        Essentials,
        Heading,
        Image,
        ImageCaption,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Base64UploadAdapter,
        Indent,
        IndentBlock,
        Italic,
        Link,
        Font,
        FontSize,
        FontFamily,
        Alignment,
        List,
        Mention,
        Paragraph,
        PasteFromOffice,
        PictureEditing,
        Table,
        TableColumnResize,
        TableToolbar,
        TextTransformation,
        Underline,
        SourceEditing,
        Code,
        CodeBlock,
        Highlight,
        HorizontalLine,
        MediaEmbed,
        RemoveFormat,
        SpecialCharacters,
        Strikethrough,
        Subscript,
        Superscript,
        WordCount,
      ],
      toolbar: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "link",
        "uploadImage",
        "insertTable",
        "blockQuote",
        "code",
        "codeBlock",
        "mediaEmbed",
        "horizontalLine",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "highlight",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "removeFormat",
        "specialCharacters",
        "subscript",
        "superscript",
        "sourceEditing",
      ],
      fontSize: {
        options: [10, 12, 14, "default", 18, 20, 24],
      },
      fontFamily: {
        options: [
          "default",
          "Arial, Helvetica, sans-serif",
          "Courier New, Courier, monospace",
          "Georgia, serif",
          "Times New Roman, Times, serif",
          "Verdana, Geneva, sans-serif",
          "Comic Sans MS, cursive",
          "Cairo, sans-serif",
          "Amiri, serif",
          "Almarai, sans-serif",
          "El Messiri, sans-serif",
          "Reem Kufi, sans-serif",
        ],
      },
       alignment: {
      options: ["left", "center", "right", "justify"],
    },
      image: {
        toolbar: [
          "imageTextAlternative",
          "toggleImageCaption",
          "|",
          "imageStyle:inline",
          "imageStyle:wrapText",
          "imageStyle:breakText",
          "|",
          "resizeImage",
        ],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
    }),
    [config?.language, config?.placeholder]
  );

  return (
    <div
      className="ckeditor-container"
      dir={config?.direction ?? "ltr"}
    >
      <CKEditor
        editor={ClassicEditor}
        data={editorData} // ✅ CORRECT
        config={editorConfig}
        onChange={(_, editor) => {
          handleOnUpdate(editor.getData());
        }}
      />
    </div>
  );
};

export default CkEditor;