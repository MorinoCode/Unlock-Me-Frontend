import React, { useState, useCallback } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import toast from 'react-hot-toast';
import './CreatePostModal.css';

const CreatePostModal = ({ closeModal, refreshFeed }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createFileFromCrop = async () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        }, 'image/jpeg');
      };
      img.onerror = (e) => reject(e);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !description.trim()) {
      toast.error("Please select an image and write a caption");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing and uploading...");

    try {
      const croppedBlob = await createFileFromCrop();
      const formData = new FormData();
      // نام فیلد 'image' باید دقیقا با upload.single('image') در بک‌اِند یکی باشد
      formData.append('image', croppedBlob, 'post.jpg');
      formData.append('description', description);

      const response = await fetch(`${API_URL}/api/posts/create`, {
        method: 'POST',
        credentials: 'include', // ارسال کوکی برای حل خطای 401
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        // اگر سرور خطای 401 یا 500 بدهد، پیام آن را اینجا می‌بینیم
        throw new Error(data.message || 'Server responded with an error');
      }

      toast.success("Successfully posted!", { id: toastId });
      refreshFeed();
      closeModal();
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error(err.message || "Failed to share post", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-modal-backdrop">
      <div className="post-modal-container">
        <div className="post-modal-top">
          <h2>Create New Post</h2>
          <button className="post-modal-close" onClick={closeModal}>
            <X size={24} />
          </button>
        </div>

        <form className="post-modal-body" onSubmit={handleSubmit}>
          <div className="post-modal-upload-zone">
            {!image ? (
              <label className="upload-placeholder">
                <ImageIcon size={40} />
                <span>Select a photo</span>
                <input type="file" accept="image/*" onChange={onSelectFile} hidden />
              </label>
            ) : (
              <div className="easy-crop-container">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
                <div className="crop-controls">
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(e.target.value)}
                    className="zoom-range"
                  />
                  <button type="button" className="btn-change-photo" onClick={() => setImage(null)}>
                    Change Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="post-modal-input-area">
            <textarea 
              placeholder="Write a caption..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="post-modal-footer">
            <button 
              type="submit" 
              className="post-submit-btn" 
              disabled={loading || !image}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Sharing...</span>
                </>
              ) : (
                'Share Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;