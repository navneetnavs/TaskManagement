import { forwardRef } from "react";

const DeleteConfirmation = forwardRef(
  ({ isOpen, onClose, onConfirm, taskTitle }, ref) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scaleIn">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-2 ml-3">
            Delete Task
          </h3>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Are you sure you want to delete the task{" "}
            <span className="font-medium text-gray-900">
              "{taskTitle}"
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 
                         hover:bg-gray-100 transition-all w-20 mb-2"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium 
                         hover:bg-red-700 transition-all w-20 mb-2 mr-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default DeleteConfirmation;
