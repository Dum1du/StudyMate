import React from "react";

export function PdfCard({ title, subtitle }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col justify-between
                    transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400">
      
      <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
        PDF Preview
      </div>

      
      <div className="mt-3 text-center">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export const pdfs = [
  { title: "Introduction to Programming", subtitle: "Course: CS101" },
  { title: "Calculus Lecture Notes", subtitle: "Course: MA202" },
  { title: "Past Exam Papers - Physics", subtitle: "Course: PH101" },
  { title: "Study Guide - Chemistry", subtitle: "Course: CH101" },
];

function Add() {
  return (
    <section className="mt-10 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pdfs.map((pdf, idx) => (
          <PdfCard key={idx} title={pdf.title} subtitle={pdf.subtitle} />
        ))}
      </div>
    </section>
  );
}

export default Add;
