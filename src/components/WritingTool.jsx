import  { useRef, useState } from "react";

const WritingTool = () => {
  const [pages, setPages] = useState([""]);
  const textRef = useRef([]);

  const handleChange = (e, pageIndex) => {
    const text = e.target.value;
  
    const lines = text.split("\n");
 
    const maxLinesPerPage = 27; 
   
    const currentPageText = lines.slice(0, maxLinesPerPage).join("\n");

    const overflowText = lines.slice(maxLinesPerPage).join("\n");
   
    const updatedPages = [...pages];

    updatedPages[pageIndex] = currentPageText;

        if(textRef.current){
            if (lines.length > maxLinesPerPage) {
                if (pages.length - 1 === pageIndex) {
                    updatedPages.push(overflowText);
                    setTimeout(() => {         
                        textRef.current[pageIndex + 1]?.focus();
                    }, 0);
                } else {
                    updatedPages[pageIndex + 1] = overflowText;
                    setTimeout(() => {
                        textRef.current[pageIndex + 1]?.focus();
                    }, 0);
                }
            } else if (pages.length > pageIndex + 1) {
                updatedPages.splice(pageIndex + 1, 1);
            }            
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
            className="w-[110mm] h-[180mm]  p-2 m-2 border border-slate-200 shadow-lg resize-none  focus:outline-none "
            placeholder="Start writing..."
            ></textarea>
      
      ))}
    </div>
  );
};

export default WritingTool;
