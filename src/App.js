import React from 'react';

const rows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "+", "´"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å", "¨"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "-", "_", "?"]
]

// create map from key to row and column
const keyMap = {};
for (let i = 0; i < rows.length; i++) {
  for (let j = 0; j < rows[i].length; j++) {
    keyMap[rows[i][j]] = { row: i, column: j };
  }
}
function App() {
  //const [midiAccess, setMidiAccess] = React.useState(null);
  const [midiOutput, setMidiOutput] = React.useState(null);

  // keep state of pressed keys
  const [pressedKeys, setPressedKeys] = React.useState(new Set());

  // create effect
  React.useEffect(() => {
    function onMIDISuccess(ma) {
      for (var entry of ma.inputs) {
        var input = entry[1];
        console.log("Input port [type:'" + input.type + "'] id:'" + input.id +
          "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
          "' version:'" + input.version + "'");
      }
      for (var entry of ma.outputs) {
        var output = entry[1];
        setMidiOutput(output)
        console.log("Output port [type:'" + output.type + "'] id:'" + output.id +
          "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
          "' version:'" + output.version + "'");
      }
    }
    function onMIDIFailure(msg) {
      console.log("Failed to get MIDI access - " + msg);
    }
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  }, []);

  function sendMidiNote(noteIdx, on) {
    var noteOnMessage = [on ? 0x90 : 0x80, noteIdx, 0x7f];    // note on, middle C, full velocity
    // get midi output
    midiOutput.send(noteOnMessage); // sends the message.
  }

  const degree2note = (degree) => {
    const degree2note = [0, 2, 4, 5, 7, 9, 11];
    const octave = Math.floor(degree / degree2note.length);
    const note = degree2note[degree % degree2note.length];
    return note + 12 * octave;
  }

  const key2note = (key) => {
    if (key in keyMap) {
      const { row, column } = keyMap[key];
      let degree = 30 - ((row) * 5 - (column + row));
      let note = degree2note(degree);
      console.log(note);
      return note;
    }
    else {
      return null;
    }

  }
  return (
    <input onKeyDown={(event) => {
      const note = key2note(event.key);
      console.log(note)
      if (note != null && !pressedKeys.has(event.key)) {
        sendMidiNote(key2note(event.key), true)
        setPressedKeys(new Set(pressedKeys.add(event.key)))
      }
    }
    }

      onKeyUp={(event) => {
        const note = key2note(event.key);
        if (note != null && pressedKeys.has(event.key)) {
          sendMidiNote(key2note(event.key), false)
          setPressedKeys(new Set((pressedKeys.delete(event.key), pressedKeys)))
        }
      }}
    >
    </input >
  );
}
export default App;
