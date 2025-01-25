import { useRef, useState } from "react";

const WritingTool = () => {
  const [pages, setPages] = useState([""]);
  const textRef = useRef([]);

  const maxLinesPerPage = 27;
  const maxWordsPerPage = 150;

  const handleChange = (e, pageIndex) => {
    const text = e.target.value;
    const lines = text.split("\n");
    
    const currentPageText = [];
    let overflowText = "";

    
    let wordCount = 0;
    for (let line of lines) {
      const lineWords = line.split(/\s+/);
      if (wordCount + lineWords.length > maxWordsPerPage || currentPageText.length >= maxLinesPerPage) {
        overflowText += line + "\n";
      } else {
        currentPageText.push(line);
        wordCount += lineWords.length;
      }
    }

    const updatedPages = [...pages];
    updatedPages[pageIndex] = currentPageText.join("\n");

    if (overflowText.trim()|| lines.length > maxLinesPerPage) {
      if (pages.length - 1 === pageIndex) {
        updatedPages.push(overflowText.trim());
      } else {
        updatedPages[pageIndex + 1] = overflowText.trim();
      }
      setTimeout(() => {
        textRef.current[pageIndex + 1]?.focus();
      }, 0);
    } else if (pages.length > pageIndex + 1) {
      updatedPages.splice(pageIndex + 1, 1); 
    }

    setPages(updatedPages);
  };

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
          className="w-[110mm] h-[180mm] p-2 m-2 border border-slate-200 shadow-lg resize-none focus:outline-none"
          placeholder={`Page ${index + 1}`}
        ></textarea>
      ))}
    </div>
  );
};

export default WritingTool;
