import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { chefAPI } from "../services/api";
import { getChefProfileCompletion } from "../utils/chefProfile";
import {
  ChefHat, Shield, Upload, Camera, FileCheck, AlertCircle,
  Clock, ArrowRight, X, CreditCard,
  ArrowLeft, Loader2,
} from "lucide-react";
import "./ChefVerification.css";

export default function ChefVerification() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [citizenNumber, setCitizenNumber] = useState("");
  const [idPhotoPreview, setIdPhotoPreview] = useState("");
  const [idPhotoName, setIdPhotoName] = useState("");
  const [idPhotoFile, setIdPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { isComplete: isChefProfileComplete } = getChefProfileCompletion(
    user?.profile,
    user
  );

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
    else if (user?.role !== "chef") navigate("/");
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user?.verificationStatus === "verified") {
      navigate("/chef-dashboard");
      return;
    }

    if (
      user?.role === "chef" &&
      user?.verificationStatus !== "pending" &&
      !isChefProfileComplete
    ) {
      toast.error("Complete your personal profile before starting verification.");
      navigate("/chef-dashboard", { replace: true });
      return;
    }

    const verificationData = user?.verificationData || {};
    if (verificationData.rejectionReason) {
      setRejectionReason(verificationData.rejectionReason);
    }
    if (verificationData.citizenNumber) {
      setCitizenNumber(verificationData.citizenNumber);
    }
  }, [user, navigate, isChefProfileComplete]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "chef") return;

    chefAPI
      .getVerificationStatus()
      .then((data) => {
        const verificationData = data.verificationData || {};
        updateUser({
          verificationStatus: data.verificationStatus,
          verificationData,
        });
        if (verificationData.rejectionReason) {
          setRejectionReason(verificationData.rejectionReason);
        }
      })
      .catch((err) => {
        console.error("Failed to load verification status:", err);
      });
  }, [isAuthenticated, user?.role, updateUser]);

  if (!user || user.role !== "chef") return null;

  const status = user.verificationStatus || "unverified";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("File must be under 3MB.");
      return;
    }
    setIdPhotoFile(file);
    setIdPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setIdPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!citizenNumber.trim() || !idPhotoFile) {
      alert("Please provide your citizen number and a photo of your ID.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("citizenNumber", citizenNumber.trim());
      formData.append("idPhoto", idPhotoFile);

      const data = await chefAPI.submitVerification(formData);
      
      updateUser({
        verificationStatus: data.verificationStatus || "pending",
        verificationData: {
          ...(data.verificationData || {}),
          citizenNumber: citizenNumber.trim(),
          submittedAt: data.verificationData?.submittedAt || new Date().toISOString(),
          rejectionReason: "",
        },
      });
    } catch (err) {
      alert(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = () => {
    updateUser({
      verificationStatus: "unverified",
      verificationData: {
        ...(user?.verificationData || {}),
        rejectionReason: "",
        citizenNumber: "",
        idPhoto: "",
      },
    });
    setCitizenNumber("");
    setIdPhotoPreview("");
    setIdPhotoName("");
    setRejectionReason("");
  };

  return (
    <div className="cv-root">
      {/* Top Bar */}
      <div className="cv-topbar">
        <Link to="/" className="cv-brand">
          <span className="cv-brand-icon"><ChefHat className="cv-brand-hat" /></span>
          <span className="cv-brand-text">Recipe<span className="cv-brand-accent">Nest</span></span>
        </Link>
        <Link to="/" className="cv-back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>

      <div className="cv-container">
        {/* ─── PENDING STATE ─── */}
        {status === "pending" && (
          <div className="cv-status-page cv-fade-in">
            <div className="cv-status-icon-wrap cv-status-pending">
              <Clock className="cv-status-icon" />
            </div>
            <h1 className="cv-status-title">Verification in Progress</h1>
            <p className="cv-status-text">
              Your identity documents have been submitted and are currently being reviewed by our team.
              This typically takes 1-2 business days.
            </p>
            <div className="cv-status-details">
              <div className="cv-status-detail-row">
                <span className="cv-detail-label">Citizen Number</span>
                <span className="cv-detail-value">{user?.verificationData?.citizenNumber || citizenNumber}</span>
              </div>
              <div className="cv-status-detail-row">
                <span className="cv-detail-label">Submitted</span>
                <span className="cv-detail-value">
                  {user?.verificationData?.submittedAt ? new Date(user.verificationData.submittedAt).toLocaleDateString() : "Just now"}
                </span>
              </div>
              <div className="cv-status-detail-row">
                <span className="cv-detail-label">Status</span>
                <span className="cv-status-badge pending">
                  <Clock size={12} />
                  Under Review
                </span>
              </div>
            </div>
            <div className="cv-status-cta">
              <p className="cv-status-hint">
                While you wait, you can start drafting your recipes.
                Publishing will be unlocked once you're verified.
              </p>
              <button className="cv-btn-primary" onClick={() => navigate("/chef-dashboard")}>
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── REJECTED STATE ─── */}
        {status === "rejected" && (
          <div className="cv-status-page cv-fade-in">
            <div className="cv-status-icon-wrap cv-status-rejected">
              <AlertCircle className="cv-status-icon" />
            </div>
            <h1 className="cv-status-title">Verification Unsuccessful</h1>
            <p className="cv-status-text">
              Unfortunately, your verification could not be completed.
              Please review the reason below and resubmit your documents.
            </p>
            {(rejectionReason || user?.verificationData?.rejectionReason) && (
              <div className="cv-rejection-box">
                <AlertCircle size={18} className="cv-rejection-icon" />
                <div>
                  <h4 className="cv-rejection-label">Reason for rejection</h4>
                  <p className="cv-rejection-reason">{rejectionReason || user?.verificationData?.rejectionReason}</p>
                </div>
              </div>
            )}
            <button className="cv-btn-primary" onClick={handleResubmit}>
              Resubmit Documents
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ─── UNVERIFIED STATE (Form) ─── */}
        {status === "unverified" && (
          <div className="cv-form-page cv-fade-in">
            <div className="cv-form-header">
              <div className="cv-form-badge">
                <Shield size={14} />
                Identity Verification
              </div>
              <h1 className="cv-form-title">Verify your identity</h1>
              <p className="cv-form-sub">
                To publish recipes on RecipeNest, we need to verify your identity.
                This helps us maintain a trusted community of authentic chefs.
              </p>
            </div>

            <form className="cv-form" onSubmit={handleSubmit}>
              {/* Step 1: Citizen Number */}
              <div className="cv-form-section">
                <div className="cv-section-header">
                  <div className="cv-section-num">1</div>
                  <div>
                    <h3 className="cv-section-title">Identity & Bio</h3>
                    <p className="cv-section-sub">Provide your credentials and a brief introduction</p>
                  </div>
                </div>
                
                <div className="cv-form-group">
                  <label className="cv-label">
                    Citizen Number <span className="cv-required">*</span>
                  </label>
                  <div className="cv-input-wrap">
                    <CreditCard className="cv-input-icon" />
                    <input
                      type="text"
                      className="cv-input"
                      placeholder="Enter your citizen or national ID number"
                      value={citizenNumber}
                      onChange={(e) => setCitizenNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Step 2: ID Photo */}
              <div className="cv-form-section">
                <div className="cv-section-header">
                  <div className="cv-section-num">2</div>
                  <div>
                    <h3 className="cv-section-title">Citizenship ID Photo</h3>
                    <p className="cv-section-sub">Upload a clear photo of your citizenship document</p>
                  </div>
                </div>
                <div
                  className={`cv-upload-zone ${idPhotoPreview ? "has-file" : ""}`}
                  onClick={() => !idPhotoPreview && fileInputRef.current?.click()}
                >
                  {idPhotoPreview ? (
                    <div className="cv-upload-preview">
                      <img src={idPhotoPreview} alt="ID Preview" className="cv-preview-img" />
                      <div className="cv-preview-overlay">
                        <div className="cv-preview-info">
                          <FileCheck size={16} />
                          <span>{idPhotoName}</span>
                        </div>
                        <button
                          type="button"
                          className="cv-preview-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIdPhotoPreview("");
                            setIdPhotoName("");
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="cv-upload-empty">
                      <div className="cv-upload-icon-wrap">
                        <Camera className="cv-upload-icon" />
                      </div>
                      <p className="cv-upload-text">Click to upload your ID photo</p>
                      <p className="cv-upload-hint">JPG, PNG, or WebP -- Max 5MB</p>
                      <span className="cv-upload-btn">
                        <Upload size={14} />
                        Choose File
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="cv-file-input"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="cv-guidelines">
                  <h4 className="cv-guidelines-title">Photo guidelines</h4>
                  <ul className="cv-guidelines-list">
                    <li>Full document must be visible, no cropping</li>
                    <li>Photo and text must be clearly readable</li>
                    <li>No glare, blur, or obstructions</li>
                    <li>Only original documents accepted</li>
                  </ul>
                </div>
              </div>

              {/* Security Note */}
              <div className="cv-security-note">
                <Shield size={18} className="cv-security-icon" />
                <div>
                  <h4 className="cv-security-title">Your data is secure</h4>
                  <p className="cv-security-text">
                    All documents are encrypted and transmitted via secure channels.
                    ID photos are accessed via time-limited links and never stored permanently.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="cv-btn-submit"
                disabled={!citizenNumber.trim() || !idPhotoPreview || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="cv-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Submit for Verification
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
