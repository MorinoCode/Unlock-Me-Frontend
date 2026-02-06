import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Filter, X, Calendar, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoDateCard from "../../components/goDateComponents/goDateCard/GoDateCard";
import CreateDateModal from "../../components/goDateComponents/createDateModal/CreateDateModal";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { useGoDateStore } from "../../store/goDateStore";
import "./GoDatePage.css";

const GoDatePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const userId = currentUser?._id || currentUser?.userId;
  const [activeTab, setActiveTab] = useState("browse");
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("");

  const [showSubModal, setShowSubModal] = useState(false);
  const [limitMsg, setLimitMsg] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const getCached = useGoDateStore((s) => s.getCached);
  const fetchDates = useGoDateStore((s) => s.fetchDates);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const city = (filterCity || "").trim();
    const category = (filterCategory || "all").trim();
    const cached = getCached(userId, activeTab, city, category);

    const applyCached = (entry) => {
      if (!entry || !mountedRef.current) return;
      setDates(entry.dates ?? []);
    };

    if (cached) {
      applyCached(cached);
      setLoading(false);
      fetchDates(API_URL, userId, activeTab, city, category, true, null).then(
        () => {
          if (mountedRef.current)
            applyCached(getCached(userId, activeTab, city, category));
        }
      );
    } else {
      setLoading(true);
      fetchDates(API_URL, userId, activeTab, city, category, false, null)
        .then(() => {
          if (mountedRef.current) {
            applyCached(getCached(userId, activeTab, city, category));
            setLoading(false);
          }
        })
        .catch(() => {
          if (mountedRef.current) setLoading(false);
        });
    }
  }, [
    userId,
    activeTab,
    filterCity,
    filterCategory,
    API_URL,
    getCached,
    fetchDates,
  ]);

  const handleCreateDate = async (formDataObj) => {
    try {
      const formData = new FormData();
      Object.keys(formDataObj).forEach((key) => {
        formData.append(key, formDataObj[key]);
      });

      const res = await fetch(`${API_URL}/api/go-date/create`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.status === 403) {
        const data = await res.json();
        setLimitMsg(data.message || t("chat.limitReached"));
        setShowCreate(false);
        setShowSubModal(true);
        return;
      }

      if (res.ok) {
        const newDate = await res.json();
        toast.success(t("createDate.dateCreatedSuccess"));
        setShowCreate(false);
        setActiveTab("mine");
        setDates((prev) => [
          {
            ...newDate,
            applicants: newDate.applicants || [],
            acceptedUser: newDate.acceptedUser || null,
          },
          ...prev,
        ]);
      } else {
        toast.error(t("createDate.failedToCreate"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("createDate.errorCreating"));
    }
  };

  const handleApply = async (dateId) => {
    try {
      const res = await fetch(`${API_URL}/api/go-date/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateId }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Request Sent!");
        setDates((prev) =>
          prev.map((d) => (d._id === dateId ? { ...d, hasApplied: true } : d))
        );
      } else {
        const data = await res.json();
        toast.error(data.message || data.error || "Error applying");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleWithdraw = async (dateId) => {
    try {
      const res = await fetch(`${API_URL}/api/go-date/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateId }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Request Withdrawn");
        setDates((prev) =>
          prev.map((d) => (d._id === dateId ? { ...d, hasApplied: false } : d))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAccept = async (dateId, applicantId) => {
    try {
      const res = await fetch(`${API_URL}/api/go-date/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateId, applicantId }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Match Confirmed! Redirecting to chat...");

        // ✅ آپدیت فوری UI: دیت را پیدا کن و وضعیتش را تغییر بده
        // این کار باعث می‌شود UI بلافاصله لیست درخواست‌ها را ببندد و ارور ندهد
        setDates((prevDates) =>
          prevDates.map((d) => {
            if (d._id === dateId) {
              // پیدا کردن اطلاعات اپلیکنت برای نمایش
              const acceptedApplicant = d.applicants.find(
                (app) => app._id === applicantId
              );
              return {
                ...d,
                status: "closed",
                acceptedUser: acceptedApplicant, // ست کردن یوزر قبول شده
              };
            }
            return d;
          })
        );

        // انتقال به چت با کمی تاخیر برای دیدن موفقیت
        setTimeout(() => {
          if (data.chatRuleId) {
            navigate(`/chat/${applicantId}`);
          }
        }, 1000);
      } else {
        toast.error(data.error || "Failed to accept");
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error");
    }
  };

  const doCancelDate = async (dateId) => {
    try {
      const res = await fetch(`${API_URL}/api/go-date/${dateId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("goDate.dateCancelled"));
        setDates((prev) =>
          prev.map((d) =>
            d._id === dateId ? { ...d, status: "cancelled" } : d
          )
        );
      } else {
        toast.error(data.message || data.error || t("goDate.failedToCancel"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("goDate.connectionError"));
    }
  };

  const handleCancel = (dateId) => {
    toast(
      (t) => (
        <span className="godate-toast-wrap">
          <div className="godate-toast-text">
            <strong>{t("goDate.cancelDateConfirm")}</strong>
            <span className="godate-toast-subtext">{t("goDate.cancelDateNotify")}</span>
          </div>
          <div className="godate-toast-btns">
            <button
              type="button"
              className="godate-toast-confirm-btn godate-toast-confirm-btn--danger"
              onClick={() => {
                toast.dismiss(t.id);
                doCancelDate(dateId);
              }}
            >
              {t("goDate.confirm")}
            </button>
            <button
              type="button"
              className="godate-toast-cancel-btn"
              onClick={() => toast.dismiss(t.id)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const doDeleteDate = async (dateId) => {
    try {
      const res = await fetch(`${API_URL}/api/go-date/${dateId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success(t("goDate.dateDeleted"));
        setDates((prev) => prev.filter((d) => d._id !== dateId));
      } else {
        const data = await res.json();
        toast.error(data.message || data.error || t("goDate.failedToDelete"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (dateId) => {
    toast(
      (toastId) => (
        <span className="godate-toast-wrap">
          {t("goDate.deleteDatePlanConfirm")}
          <div className="godate-toast-btns">
            <button
              type="button"
              className="godate-toast-confirm-btn godate-toast-confirm-btn--danger"
              onClick={() => {
                toast.dismiss(toastId.id);
                doDeleteDate(dateId);
              }}
            >
              {t("common.delete")}
            </button>
            <button
              type="button"
              className="godate-toast-cancel-btn"
              onClick={() => toast.dismiss(toastId.id)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  return (
    <ExploreBackgroundLayout>
      <div className="go-date-wrapper">
        <div className="go-date-header-tabs">
          <button
            className={`go-date-tab ${activeTab === "browse" ? "active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            <Calendar size={18} />
            {t("goDate.browseDates")}
          </button>
          <button
            className={`go-date-tab ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            <User size={18} />
            {t("goDate.myPlans")}
          </button>
        </div>

        {activeTab === "browse" && (
          <div className="go-date-filters-container">
            <div className="go-date-filter-pill">
              <Filter size={14} className="filter-icon" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="go-date-filter-select"
              >
                <option value="all">{t("goDate.allCategories")}</option>
                <option value="coffee">☕ Coffee</option>
                <option value="food">🍽️ Food</option>
                <option value="drink">🍷 Drink</option>
                <option value="movie">🎬 Movie</option>
                <option value="activity">🏃 Activity</option>
              </select>
            </div>

            <div className="go-date-filter-pill">
              <MapPin size={14} className="filter-icon" />
              <input
                type="text"
                placeholder={t("goDate.searchCity")}
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="go-date-filter-input"
              />
              {filterCity && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setFilterCity("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="go-date-grid">
          {loading ? (
            <div className="go-date-loading-state">
              <div className="loading-spinner"></div>
            </div>
          ) : dates.length === 0 ? (
            <div className="go-date-empty-state">
              {activeTab === "browse" ? (
                <>
                  <h3>{t("goDate.noUpcomingDates")}</h3>
                  <p>{t("goDate.noUpcomingDatesDesc")}</p>
                </>
              ) : (
                <>
                  <h3>{t("goDate.noPlansYet")}</h3>
                  <p>{t("goDate.noPlansYetDesc")}</p>
                </>
              )}
            </div>
          ) : (
            dates.map((date) => (
              <GoDateCard
                key={date._id}
                date={date}
                isOwner={activeTab === "mine"}
                onApply={handleApply}
                onWithdraw={handleWithdraw}
                onAccept={handleAccept}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <button className="go-date-fab" onClick={() => setShowCreate(true)}>
          <Plus size={32} />
        </button>

        {showCreate && (
          <CreateDateModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreateDate}
            loading={loading && showCreate}
          />
        )}

        {showSubModal && (
          <SubscriptionModal
            onClose={() => setShowSubModal(false)}
            message={limitMsg}
          />
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default GoDatePage;
