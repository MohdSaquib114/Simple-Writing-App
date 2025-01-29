// import { useEffect, useRef, useState } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { PageBreak } from "./PageBreak"; 

// const PAGE_HEIGHT = 1056;

// const Editor = () => {
//   const [contentHeight, setContentHeight] = useState(0);
//   const editorRef = useRef(null);

//   const editor = useEditor({
//     extensions: [StarterKit, PageBreak],
//     content: "<p>Start typing...</p>",
//   });

//   // Function to check content height and insert page breaks
//   const checkPagination = () => {
//     if (!editor || !editorRef.current) return;

//     const contentDiv = editorRef.current.querySelector(".ProseMirror");
//     if (!contentDiv) return;

//     let totalHeight = 0;
//     let pageBreakPositions = [];

//     const childNodes = contentDiv.children;

//     for (let i = 0; i < childNodes.length; i++) {
//       totalHeight += childNodes[i].offsetHeight;

//       if (totalHeight > PAGE_HEIGHT) {
//         pageBreakPositions.push(i);
//         totalHeight = childNodes[i].offsetHeight; // Reset height for next page
//       }
//     }

//     // Insert page breaks at calculated positions
//     pageBreakPositions.forEach((position) => {
//       editor.commands.insertContentAt(position, '<div class="page-break"></div>');
//     });

//     setContentHeight(contentDiv.scrollHeight);
//   };

//   // Run pagination check when content changes
//   useEffect(() => {
//     if (editor) {
//       editor.on("update", checkPagination);
//     }
//   }, [editor]);

//   if (!editor) return null;

//   return (
//     <div className="p-4 m-2 border border-slate-300 shadow-xl">
//       <EditorContent ref={editorRef} editor={editor} className="min-h-[300px] focus:outline-none" />
//       <p className="text-sm mt-2 text-gray-500">
//         Document Height: {contentHeight}px (Page Limit: {PAGE_HEIGHT}px)
//       </p>
//     </div>
//   );
// };

// export default Editor;
import { useState, useRef, useEffect } from 'react';

const DocsEditor = () => {
  const [pages, setPages] = useState([{ content: '', id: 1 }]);
  const textareaRefs = useRef([]);

  // A4 dimensions in pixels (assuming 96 DPI)
  const A4_HEIGHT = 1123; // 297mm
  const A4_WIDTH = 794;  // 210mm
  const MARGIN = 96; // 1 inch margins

  useEffect(() => {
    textareaRefs.current = textareaRefs.current.slice(0, pages.length);
  }, [pages]);

  const splitContentIfNeeded = (content, pageIndex) => {
    const textarea = textareaRefs.current[pageIndex];
    if (!textarea) return { currentPageContent: content, nextPageContent: '' };

    // Create a temporary div to measure content height
    const temp = document.createElement('div');
    temp.style.width = `${A4_WIDTH - (2 * MARGIN)}px`;
    temp.style.fontSize = '16px';
    temp.style.lineHeight = '1.5';
    temp.style.whiteSpace = 'pre-wrap';
    temp.textContent = content;
    document.body.appendChild(temp);
    
    const contentHeight = temp.offsetHeight;
    document.body.removeChild(temp);

    const maxHeight = A4_HEIGHT - (2 * MARGIN);

    if (contentHeight > maxHeight) {
      // Content needs to be split
      let low = 0;
      let high = content.length;
      let mid;
      let lastGoodSplit = 0;

      // Binary search for split point
      while (low < high) {
        mid = Math.floor((low + high) / 2);
        const splitPoint = content.lastIndexOf(' ', mid);
        
        temp.textContent = content.slice(0, splitPoint);
        document.body.appendChild(temp);
        const testHeight = temp.offsetHeight;
        document.body.removeChild(temp);

        if (testHeight <= maxHeight) {
          lastGoodSplit = splitPoint;
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      return {
        currentPageContent: content.slice(0, lastGoodSplit),
        nextPageContent: content.slice(lastGoodSplit + 1)
      };
    }

    return { currentPageContent: content, nextPageContent: '' };
  };

  const handleContentChange = (e, pageIndex) => {
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const updatedPages = [...pages];
    const { currentPageContent, nextPageContent } = splitContentIfNeeded(e.target.value, pageIndex);
    
    updatedPages[pageIndex].content = currentPageContent;

    if (nextPageContent) {
      if (pageIndex === pages.length - 1) {
        // Create new page
        updatedPages.push({ content: nextPageContent, id: pages.length + 1 });
      } else {
        // If cursor was in the overflowed content, calculate its new position
        const overflowPoint = currentPageContent.length;
        const cursorInOverflow = cursorPosition > overflowPoint;
        
        // Insert overflowed content at the beginning of next page
        updatedPages[pageIndex + 1].content = nextPageContent + updatedPages[pageIndex + 1].content;
      
        setPages(updatedPages);

        // Move cursor to appropriate position
        setTimeout(() => {
          const nextTextarea = textareaRefs.current[pageIndex + 1];
          if (nextTextarea) {
            nextTextarea.focus();
            if (cursorInOverflow) {
              // Place cursor relative to the start of overflowed content
              const newPosition = cursorPosition - overflowPoint - 1;
              nextTextarea.setSelectionRange(newPosition, newPosition);
            } else {
              // Place cursor at the start if adding at page boundary
              nextTextarea.setSelectionRange(0, 0);
            }
            nextTextarea.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
      }
    }
    
    setPages(updatedPages);
  };
  const handleKeyDown = (e, pageIndex) => {
    const textarea = textareaRefs.current[pageIndex];
  
    // Only handle Backspace if the cursor is at the beginning of the page
    if (e.key === 'Backspace' && textarea.selectionStart === 0 && pageIndex > 0) {
      e.preventDefault();
  
      // Merge the content of the previous page with the current page
      const updatedPages = [...pages];
      const prevPageContent = updatedPages[pageIndex - 1].content;
      const currentPageContent = updatedPages[pageIndex].content;
      const mergedContent = prevPageContent + currentPageContent;
  
      // Update the previous page with the merged content
      updatedPages[pageIndex - 1].content = mergedContent;
  
      // Remove the current page
      updatedPages.splice(pageIndex, 1);
  
      // Update state with the merged pages
      setPages(updatedPages);
  
      // Focus the previous page's textarea
      setTimeout(() => {
        const prevTextarea = textareaRefs.current[pageIndex - 1];
        if (prevTextarea) {
          prevTextarea.focus();
          prevTextarea.setSelectionRange(prevPageContent.length, prevPageContent.length); // Set cursor to end of previous content
          prevTextarea.scrollIntoView({ behavior: 'smooth' });
  
          // Check if merged content needs to be split again
          const { currentPageContent, nextPageContent } = splitContentIfNeeded(mergedContent, pageIndex - 1);
          if (nextPageContent) {
            const newUpdatedPages = [...updatedPages];
            newUpdatedPages[pageIndex - 1].content = currentPageContent;
            newUpdatedPages.splice(pageIndex, 0, { content: nextPageContent, id: Date.now() });
            setPages(newUpdatedPages);
          }
        }
      }, 0);
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
      {/* Toolbar */}
      <div className="sticky top-0 w-full max-w-4xl mb-4 bg-white p-2 rounded-lg shadow-sm flex items-center justify-between z-10">
        <span className="text-sm">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </span>
      </div>

      {/* Pages Container */}
      <div className="flex flex-col items-center space-y-8">
        {pages.map((page, index) => (
          <div 
            key={page.id}
            className="bg-white shadow-lg relative"
            style={{
              width: `${A4_WIDTH}px`,
              height: `${A4_HEIGHT}px`,
              padding: `${MARGIN}px`,
            }}
          >
            <div className="absolute top-4 left-4 text-sm text-gray-400">
              Page {index + 1}
            </div>
            <textarea
              ref={el => textareaRefs.current[index] = el}
              value={page.content}
              onChange={(e) => handleContentChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-full h-full resize-none border-none focus:outline-none"
              style={{
                lineHeight: '1.5',
                fontSize: '16px',
                height: `${A4_HEIGHT - (2 * MARGIN)}px`,
                overflow: 'hidden'
              }}
              placeholder={index === 0 ? "Start typing..." : ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocsEditor;