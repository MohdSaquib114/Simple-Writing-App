import { useRef, useState } from "react";

const WritingTool = () => {
  const [pages, setPages] = useState([""]); // Initialize with one empty page
  const textRef = useRef([]);

  const maxLinesPerPage = 40; // Maximum lines per page
  const charPerLine = 100; // Maximum characters per line

  // Handle text changes in the textarea
  const handleChange = (e, pageIndex) => {
    const text = e.target.value;

    // Split text into lines, preserving explicit newlines
    const lines = text.split("\n");

    // Process each line to wrap text based on character limit
    const wrappedLines = lines.flatMap((line) => {
      const words = line.split(/\s+/);
      let currentLine = "";
      let charCount = 0;
      const result = [];

      words.forEach((word) => {
        if (charCount + word.length + 1 > charPerLine) {
          // If adding the word exceeds the character limit, start a new line
          result.push(currentLine.trim());
          currentLine = word + " ";
          charCount = word.length + 1;
        } else {
          // Otherwise, add the word to the current line
          currentLine += word + " ";
          charCount += word.length + 1;
        }
      });

      // Add the remaining text in the current line
      if (currentLine.trim()) {
        result.push(currentLine.trim());
      }

      return result;
    });

    // Split lines into current page and overflow text
    const currentPageText = wrappedLines.slice(0, maxLinesPerPage).join("\n");
    const overflowText = wrappedLines.slice(maxLinesPerPage).join("\n");

    const updatedPages = [...pages];
    updatedPages[pageIndex] = currentPageText;

    // Handle overflow text
    if (overflowText) {
      if (pages.length - 1 === pageIndex) {
        // Add a new page if overflow text exists and it's the last page
        updatedPages.push(overflowText);
      } else {
        // Update the next page with overflow text
        updatedPages[pageIndex + 1] = overflowText + (updatedPages[pageIndex + 1] || "");
      }
    }

    // Remove empty pages below the current page
    for (let i = updatedPages.length - 1; i > pageIndex; i--) {
      if (updatedPages[i].trim() === "") {
        updatedPages.pop();
      } else {
        break;
      }
    }

    setPages(updatedPages);

    // Focus the next page if there's overflow text
    if (overflowText && textRef.current[pageIndex + 1]) {
      setTimeout(() => {
        const nextTextarea = textRef.current[pageIndex + 1];
        nextTextarea.focus();

        // Move the cursor to the start of the next page's text
        nextTextarea.setSelectionRange(0, 0);
      }, 0);
    } else if (textRef.current[pageIndex]) {
      // Restore the cursor position in the current textarea
      const currentTextarea = textRef.current[pageIndex];
      const cursorPosition = e.target.selectionStart;

      setTimeout(() => {
        currentTextarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  // Add a reference to the textarea
  const addPageRef = (ref, index) => {
    if (ref && !textRef.current[index]) {
      textRef.current[index] = ref;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {pages.map((content, index) => (
        <textarea
          key={index}
          value={content}
          ref={(ref) => addPageRef(ref, index)}
          onChange={(e) => handleChange(e, index)}
          className="w-[210mm] h-[280mm] p-2 m-2 border border-slate-200 shadow-lg resize-none focus:outline-none overflow-hidden"
          placeholder={`Page ${index + 1}`}
          rows={maxLinesPerPage} // Set the number of visible rows
          style={{ overflow: "hidden" }} // Disable scrolling
        />
      ))}
    </div>
  );
};

export default WritingTool;