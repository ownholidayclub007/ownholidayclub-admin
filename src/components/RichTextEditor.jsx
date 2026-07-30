import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link as LinkIcon, Palette } from 'lucide-react';

const rgbToHex = (color) => {
    if (!color) return "#333333"; // default color
    
    // Check if it's already a hex color
    if (color.startsWith('#')) {
        if (color.length === 4) {
            return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        return color;
    }

    // Try to match rgb or rgba
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i;
    const match = color.match(rgbRegex);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toLowerCase();
    }

    // If it's a named color, e.g. "yellow", "red" etc.
    try {
        const temp = document.createElement('span');
        temp.style.color = color;
        document.body.appendChild(temp);
        const computedColor = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        
        const computedMatch = computedColor.match(rgbRegex);
        if (computedMatch) {
            const r = parseInt(computedMatch[1]).toString(16).padStart(2, '0');
            const g = parseInt(computedMatch[2]).toString(16).padStart(2, '0');
            const b = parseInt(computedMatch[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`.toLowerCase();
        }
    } catch (e) {
        console.error("Error converting named color to hex:", e);
    }

    return "#333333";
};

const RichTextEditor = ({ value, onChange, placeholder, minHeight = "300px", isCodeEditor = false }) => {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [textColor, setTextColor] = useState("#333333");
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        formatBlock: 'p'
    });

    // Sync from parent to editor (initial load or external updates)
    useEffect(() => {
        if (!isCodeEditor && editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value, isCodeEditor]);

    const updateActiveFormats = useCallback(() => {
        if (!isCodeEditor && editorRef.current) {
            // Save selection range if it's within the editor
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (editorRef.current.contains(range.commonAncestorContainer)) {
                    savedRangeRef.current = range;
                }
            }

            const formatBlockValue = document.queryCommandValue("formatBlock");
            setActiveFormats({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
                justifyLeft: document.queryCommandState("justifyLeft"),
                justifyCenter: document.queryCommandState("justifyCenter"),
                justifyRight: document.queryCommandState("justifyRight"),
                insertUnorderedList: document.queryCommandState("insertUnorderedList"),
                insertOrderedList: document.queryCommandState("insertOrderedList"),
                formatBlock: formatBlockValue || 'p'
            });

            // Update text color of the current selection
            try {
                const foreColorValue = document.queryCommandValue("foreColor");
                if (foreColorValue) {
                    setTextColor(rgbToHex(foreColorValue));
                } else {
                    setTextColor("#333333");
                }
            } catch (err) {
                console.error("Error queryCommandValue foreColor:", err);
            }
        }
    }, [isCodeEditor]);

    const restoreSelection = () => {
        if (savedRangeRef.current) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
        }
    };

    const execCommand = (command, val = null) => {
        if (editorRef.current) {
            restoreSelection();
            editorRef.current.focus();
            document.execCommand(command, false, val);
            handleInput();
            updateActiveFormats();
        }
    };

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current?.innerHTML || "");
        }
    };

    const handlePaste = (e) => {
        if (isCodeEditor) {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        } else {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        }
    };

    const insertLink = (e) => {
        e.preventDefault();
        const selection = window.getSelection();
        let currentLink = null;
        if (selection.rangeCount > 0) {
            let container = selection.getRangeAt(0).startContainer;
            if (container.nodeType === 3) container = container.parentNode;
            while (container && container !== editorRef.current) {
                if (container.tagName === 'A') {
                    currentLink = container;
                    break;
                }
                container = container.parentNode;
            }
        }
        if (currentLink) {
            execCommand("unlink");
        } else {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
        }
    };

    const handleAction = (e, command, val = null) => {
        e.preventDefault();
        execCommand(command, val);
    };

    const applyFontSize = (size) => {
        if (!size) return;
        
        restoreSelection();
        editorRef.current.focus();

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        // Force standard font tag generation by disabling CSS-based styling temporarily
        document.execCommand('styleWithCSS', false, false);
        document.execCommand('fontSize', false, '7'); 
        
        // Find the newly created font tags (marked with size 7) and convert them to px-styled spans or keep font tags
        const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
        fontElements.forEach(font => {
            font.removeAttribute("size");
            font.style.fontSize = `${size}px`;
            font.style.lineHeight = "1.2";
            font.style.display = "inline-block";
        });
        
        handleInput();
        updateActiveFormats();
    };

    const getActiveStyle = (isActive) => isActive 
        ? "bg-blue-100 border-blue-400 text-blue-700" 
        : "bg-white border-gray-300";

    return (
        <div className="border-2 border-gray-200 rounded overflow-hidden shadow-inner bg-white">
            {!isCodeEditor && (
                <div 
                    className="bg-gray-50 p-2 border-b-2 border-gray-200 flex flex-wrap gap-1 items-center"
                    onMouseDown={(e) => {
                        // Keep track of selection before focus might be lost
                        updateActiveFormats();
                    }}
                >
                    <button type="button" onMouseDown={(e) => handleAction(e, "bold")} className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded font-bold border-2 text-sm shadow-sm ${getActiveStyle(activeFormats.bold)}`}>B</button>
                    <button type="button" onMouseDown={(e) => handleAction(e, "italic")} className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded italic border-2 text-sm shadow-sm ${getActiveStyle(activeFormats.italic)}`}>I</button>
                    <button type="button" onMouseDown={(e) => handleAction(e, "underline")} className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded underline border-2 text-sm shadow-sm ${getActiveStyle(activeFormats.underline)}`}>U</button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <button type="button" onMouseDown={(e) => handleAction(e, "justifyLeft")} className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm ${getActiveStyle(activeFormats.justifyLeft)}`}>≡</button>
                    <button type="button" onMouseDown={(e) => handleAction(e, "justifyCenter")} className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm ${getActiveStyle(activeFormats.justifyCenter)}`}>≡</button>
                    <button type="button" onMouseDown={(e) => handleAction(e, "justifyRight")} className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm ${getActiveStyle(activeFormats.justifyRight)}`}>≡</button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <button type="button" onMouseDown={(e) => handleAction(e, "insertUnorderedList")} className={`px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-[11px] font-bold shadow-sm gap-1 ${getActiveStyle(activeFormats.insertUnorderedList)}`}>● List</button>
                    <button type="button" onMouseDown={(e) => handleAction(e, "insertOrderedList")} className={`px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-[11px] font-bold shadow-sm gap-1 ${getActiveStyle(activeFormats.insertOrderedList)}`}>1. List</button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <select
                        onChange={(e) => execCommand("formatBlock", e.target.value)}
                        onFocus={restoreSelection}
                        value={activeFormats.formatBlock}
                        className="h-9 border-2 text-[11px] font-bold px-2 rounded shadow-sm focus:outline-none min-w-[100px]"
                    >
                        <option value="p">Body Text</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>

                    <button type="button" onMouseDown={insertLink} className="w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-sm shadow-sm text-blue-600"><LinkIcon size={16} /></button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    {/* Color Picker */}
                    <div className="relative group/color flex items-center gap-2 px-2 h-9 hover:bg-white rounded border-2 border-gray-300 shadow-sm transition-colors">
                        <div className="flex items-center gap-1">
                            <Palette size={14} className="text-gray-500" />
                            <input
                                type="color"
                                value={textColor}
                                onFocus={restoreSelection}
                                onChange={(e) => {
                                    setTextColor(e.target.value);
                                    execCommand("foreColor", e.target.value);
                                }}
                                className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                                title="Text Color"
                            />
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    {/* Font Size */}
                    <div className="flex items-center gap-2 px-2 h-9 hover:bg-white rounded border-2 border-gray-300 shadow-sm transition-colors">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Size</span>
                        <input
                            type="number"
                            defaultValue="60"
                            className="w-12 h-6 text-xs bg-transparent focus:outline-none font-bold text-gray-700"
                            onFocus={restoreSelection}
                            onChange={(e) => applyFontSize(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    applyFontSize(e.target.value);
                                    editorRef.current.focus();
                                }
                            }}
                        />
                        <span className="text-[10px] font-bold text-gray-400">px</span>
                    </div>
                </div>
            )}

            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onMouseUp={updateActiveFormats}
                onKeyUp={updateActiveFormats}
                onFocus={updateActiveFormats}
                onSelect={updateActiveFormats}
                className="p-6 focus:outline-none max-w-none text-gray-700 bg-white overflow-y-auto leading-relaxed prose"
                style={{ minHeight: minHeight }}
                placeholder={placeholder}
            ></div>

            <style dangerouslySetInnerHTML={{
                __html: `
                [contenteditable] { outline: none; color: #333333; text-align: left !important; line-height: 1.6 !important; }
                [contenteditable] p { margin-bottom: 0.5rem !important; }
                [contenteditable] a { color: #2563eb !important; text-decoration: underline !important; cursor: pointer; }
                [contenteditable]:empty:before { content: attr(placeholder); color: #9ca3af; font-style: italic; pointer-events: none; }
                [contenteditable] ul { list-style-type: disc !important; padding-left: 1.5rem !important; }
                [contenteditable] ol { list-style-type: decimal !important; padding-left: 1.5rem !important; }
            ` }} />
        </div>
    );
};

export default RichTextEditor;
