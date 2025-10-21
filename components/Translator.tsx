import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TranslationMode } from '../types';
import * as geminiService from '../services/geminiService';
import { TextIcon, ImageIcon, FileTextIcon, LoaderIcon, CopyIcon, CheckIcon, UploadIcon, XIcon } from './icons/Icons';

// pdfjs is loaded from CDN in index.html
declare const pdfjsLib: any;

const Translator: React.FC = () => {
    const [mode, setMode] = useState<TranslationMode>(TranslationMode.Text);
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }, []);
    
    useEffect(() => {
        // Reset state when mode changes
        setInputText('');
        setFile(null);
        setFilePreview(null);
        setTranslatedText('');
        setError(null);
        setIsLoading(false);
    }, [mode]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);

        if (mode === TranslationMode.Image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else if (mode === TranslationMode.PDF) {
            setFilePreview(selectedFile.name);
        }
    };
    
    const clearFile = () => {
        setFile(null);
        setFilePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // remove the data URL prefix
                resolve(result.split(',')[1]);
            };
            reader.onerror = error => reject(error);
        });
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        return fullText;
    };

    const handleTranslate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setTranslatedText('');

        try {
            let result = '';
            if (mode === TranslationMode.Text) {
                if (!inputText.trim()) {
                    setError('Please enter some text to translate.');
                    setIsLoading(false);
                    return;
                }
                result = await geminiService.translateText(inputText);
            } else if (mode === TranslationMode.Image && file) {
                const base64Image = await fileToBase64(file);
                result = await geminiService.translateImage(base64Image, file.type);
            } else if (mode === TranslationMode.PDF && file) {
                const pdfText = await extractTextFromPdf(file);
                 if (!pdfText.trim()) {
                    setError('Could not extract text from this PDF. It might be an image-only PDF.');
                    setIsLoading(false);
                    return;
                }
                result = await geminiService.translatePdfText(pdfText);
            } else {
                 setError('Please select a file to translate.');
                 setIsLoading(false);
                 return;
            }
            setTranslatedText(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [mode, inputText, file]);

    const copyToClipboard = () => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const renderInputArea = () => {
        switch (mode) {
            case TranslationMode.Text:
                return (
                    <textarea
                        className="w-full h-48 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none placeholder-slate-500"
                        placeholder="لێرە بنڤیسە..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading}
                    />
                );
            case TranslationMode.Image:
            case TranslationMode.PDF:
                const acceptType = mode === TranslationMode.Image ? 'image/*' : '.pdf';
                const promptText = mode === TranslationMode.Image ? 'وێنەیەکێ هەلبژێرە' : 'PDF هەلبژێرە';
                
                if (file && filePreview) {
                    return (
                        <div className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center text-center">
                            {mode === TranslationMode.Image && <img src={filePreview} alt="Preview" className="max-h-48 rounded-md mb-4 object-contain"/>}
                            <p className="text-slate-300 font-medium truncate w-full">{file.name}</p>
                            <button onClick={clearFile} className="mt-4 text-red-400 hover:text-red-300 flex items-center gap-2 text-sm" disabled={isLoading}>
                                <XIcon className="w-4 h-4" />
                                لاببـە
                            </button>
                        </div>
                    )
                }
                
                return (
                    <label className="w-full flex flex-col items-center justify-center h-48 p-4 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 hover:border-cyan-500 transition-colors duration-200">
                        <UploadIcon className="w-10 h-10 text-slate-500 mb-2" />
                        <span className="text-slate-400 font-semibold">{promptText}</span>
                        <span className="text-xs text-slate-500 mt-1">یان فایلێ بکێشە و بهاڤێژە ڤێرە</span>
                        <input ref={fileInputRef} type="file" accept={acceptType} className="hidden" onChange={handleFileChange} disabled={isLoading} />
                    </label>
                );
        }
    };
    
    // FIX: Changed JSX.Element to React.ReactElement to fix "Cannot find namespace 'JSX'" error.
    const TabButton = ({ targetMode, icon, label }: { targetMode: TranslationMode; icon: React.ReactElement; label: string }) => (
      <button
          onClick={() => setMode(targetMode)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-200 ${
              mode === targetMode
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/50'
          }`}
      >
          {icon}
          {label}
      </button>
  );


    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-900">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    Wergêr<span className="text-cyan-400">.</span>
                </h1>
                <p className="mt-2 text-lg text-slate-400">
                    ژ ئنگلیزی و عەرەبی بۆ کوردی (بادینی)
                </p>
            </header>

            <div className="bg-slate-800/50 rounded-xl shadow-2xl shadow-cyan-500/10 p-1 sm:p-2 backdrop-blur-sm border border-slate-700">
                <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex border-b border-slate-700 mb-6">
                        <TabButton targetMode={TranslationMode.Text} icon={<TextIcon className="w-5 h-5" />} label="نڤیسین" />
                        <TabButton targetMode={TranslationMode.Image} icon={<ImageIcon className="w-5 h-5" />} label="وێنە" />
                        <TabButton targetMode={TranslationMode.PDF} icon={<FileTextIcon className="w-5 h-5" />} label="PDF" />
                    </div>

                    <div className="space-y-6">
                        {renderInputArea()}

                        <div className="flex justify-center">
                            <button
                                onClick={handleTranslate}
                                disabled={isLoading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-500 text-slate-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderIcon className="animate-spin w-6 h-6" />
                                        <span>لـی دگـەریـت...</span>
                                    </>
                                ) : (
                                    'وەرگێران'
                                )}
                            </button>
                        </div>
                        
                        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}

                        {(translatedText || isLoading) && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-slate-300 mb-3">ئەنجامێ وەرگێرانێ:</h3>
                                <div className="relative w-full min-h-[12rem] p-4 bg-slate-900 border-2 border-slate-700 rounded-lg whitespace-pre-wrap">
                                    {isLoading && !translatedText && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                           <div className="space-y-3 w-full p-4">
                                                <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                                                <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                                                <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse"></div>
                                            </div>
                                        </div>
                                    )}
                                    <p>{translatedText}</p>
                                    {translatedText && (
                                        <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">
                                            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-400" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <footer className="text-center mt-8 text-slate-500 text-sm">
                <p>Powered by Gemini AI</p>
                <p className="mt-2">ئەم پلاتفورمە هاتوە دروستکردن لەلایەن ئەحمەد فەرسەت زێباری</p>
            </footer>
        </div>
    );
};

export default Translator;