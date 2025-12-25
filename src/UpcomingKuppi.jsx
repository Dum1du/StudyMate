import React from "react";

function UpcomingKuppi(props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Information Side */}
      <div>
        <h3 className="font-bold text-lg text-gray-800">{props.title}</h3>
        <p className="text-sm text-gray-600">
          Hosted by: <span className="text-blue-600">{props.host}</span>
        </p>
        <p className="text-sm text-gray-500">{props.time}</p>
      </div>

      {/* Button Side */}
      {props.link ? (
        <a
          href={props.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
        >
          Join Meeting
        </a>
      ) : (
        <span className="text-gray-400 text-sm">No link</span>
      )}
    </div>
  );
}

export default UpcomingKuppi;
