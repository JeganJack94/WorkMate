Stock Management Functionality
Prompt
User Can Enter Stock Data:

Create a form to allow users to input stock data for each system (e.g., Access Control, CCTV, Fire Alarm, PAS).

Fields to include:

Material Name: Name of the item (e.g., Card Reader, Camera, Smoke Detector).

Bill of Quantity (BOQ): Total quantity required.

Supplied Quantity: Quantity received from the supplier.

Installed Quantity: Quantity installed on-site.

ATTIC Stock: Quantity remaining in storage.

Add a "Save" button to store the data in Firestore.

Display Stock Data:

Show a table or list of stock data for the selected system.

Include columns for:

Material Name

BOQ

Supplied Qty

Installed Qty

ATTIC Stock

Allow users to edit or update stock data.

Stock Alerts:

Highlight rows where Supplied Quantity < BOQ or Installed Quantity < Supplied Quantity.

Show a warning message (e.g., "Low Stock" or "Installation Pending").

Checklist with Proof Functionality
Prompt
User Can Track Work with Proof:

Allow users to select a Floor and Door for the checklist.

For each floor and door, provide a checklist with 7 checkpoints (e.g., Wiring, Device Mounting, Power Supply, etc.).

Each checkpoint should have:

A checkbox to mark as complete.

A photo upload button to add proof (either by taking a photo or uploading from the gallery).

Checklist UI:

Create a dropdown to select Floor and Door.

Display the checklist for the selected floor and door.

For each checkpoint:

Show a checkbox and a photo upload button.

Once a photo is uploaded, display a thumbnail preview.

Allow users to remove or replace the photo.

Save Checklist Data:

Store the checklist data in Firestore, including:

Floor and Door

Checkpoint status (completed/pending)

Photo URL (if uploaded)

Generate Report:

Allow users to generate a PDF report for completed tasks.

Include:

Floor and Door details

Checklist status

Photo proofs for completed checkpoints

Example Workflow
Stock Management
User navigates to the Systems Page and selects a system (e.g., Access Control).

User clicks "Add Stock" and fills out the form:

Material Name: Card Reader

BOQ: 50

Supplied Qty: 50

Installed Qty: 30

ATTIC Stock: 20

User saves the data, and it appears in the stock table.

Checklist with Proof
User selects Floor 1 and Door 1.

User sees a checklist with 7 checkpoints:

Checkpoint 1: Wiring – Mark as complete and upload a photo.

Checkpoint 2: Device Mounting – Mark as complete and upload a photo.

User saves the checklist, and the data is stored in Firestore.

User generates a PDF report showing completed tasks with photo proofs.

Code Implementation Prompts
Stock Management
Form Component:

Create a reusable form component for entering stock data.

Use Tailwind CSS for styling.

Stock Table:

Use a table or grid to display stock data.

Add edit and delete buttons for each row.

Firestore Integration:

Create a Firestore collection for stock data.

Use addDoc to save stock data and getDocs to fetch and display it.

Checklist with Proof
Checklist Component:

Create a reusable checklist component with checkboxes and photo upload buttons.

Use a file input for photo uploads.

Photo Upload:

Use Firebase Storage to upload photos and store their URLs in Firestore.

Display photo thumbnails in the checklist.

PDF Report:

Use a library like pdf-lib or react-pdf to generate PDF reports.

Include checklist data and photo proofs in the report.

Example Code Snippets
Stock Management Form
jsx
Copy
function StockForm({ onSave }) {
  const [stock, setStock] = useState({
    materialName: "",
    boq: 0,
    suppliedQty: 0,
    installedQty: 0,
    atticStock: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(stock);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Material Name"
        value={stock.materialName}
        onChange={(e) => setStock({ ...stock, materialName: e.target.value })}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        placeholder="BOQ"
        value={stock.boq}
        onChange={(e) => setStock({ ...stock, boq: +e.target.value })}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Save
      </button>
    </form>
  );
}
Checklist Component
jsx
Copy
function Checklist({ floor, door, checkpoints, onComplete }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Floor {floor}, Door {door}</h3>
      {checkpoints.map((checkpoint, index) => (
        <div key={index} className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={checkpoint.completed}
            onChange={() => onComplete(index)}
          />
          <span>{checkpoint.name}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onUploadPhoto(index, e.target.files[0])}
          />
          {checkpoint.photoUrl && (
            <img src={checkpoint.photoUrl} alt="Proof" className="w-12 h-12" />
          )}
        </div>
      ))}
    </div>
  );
}
T