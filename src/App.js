import "./App.css";
import Crop from "./components/Crop";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>{"1. Allow user to upload image."}</p>
        <p>{"2. Allow user to crop image to a square."}</p>
        <p>
          {
            "3. Compress the image such that it is less than 1 mb and save it locally."
          }
        </p>
        <p>{"You can use any packages. Styling is not so important."}</p>
        <Crop />
        <button>Upload image</button>
      </header>
    </div>
  );
}

export default App;
