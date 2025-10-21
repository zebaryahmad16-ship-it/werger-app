
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-4xl w-full">
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20 mb-8">
          <img 
            src="https://picsum.photos/1200/800?grayscale&blur=2&random=1" 
            alt="Abstract background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tighter">
              Wergêr
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-cyan-400 mt-2">
              وەرگێر
            </p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-4">
            پلاتفورمەکا زیرەک بۆ وەرگێرانێ
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
            ئەم پلاتفورمە یارمەتیا قوتابی و خەلکێ گشتی ددەت بۆ وەرگێرانا نڤیسین، وێنە، و بەلگەنامێن PDF ژ زمانێن ئنگلیزی و عەرەبی بۆ سەر زمانێ کوردی (زاراڤێ بادینی) ب شێوەیەکێ بساناهی و بلەز.
          </p>
          <button
            onClick={onStart}
            className="bg-cyan-500 text-slate-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
          >
            دەستپێبکە
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
