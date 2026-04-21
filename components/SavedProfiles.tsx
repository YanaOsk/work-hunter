"use client";

import { useState, useEffect } from "react";
import { SavedProfile, getSavedProfiles, deleteProfile, getInitials, getAvatarColor } from "@/lib/profiles";
import { UserProfile } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

interface Props {
  onSelect: (profile: UserProfile) => void;
}

export default function SavedProfiles({ onSelect }: Props) {
  const { lang } = useLanguage();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setProfiles(getSavedProfiles());
  }, []);

  if (profiles.length === 0) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProfile(id);
    setProfiles(getSavedProfiles());
  };

  const label = lang === "he" ? "חזרת? בחר/י פרופיל" : "Welcome back! Choose your profile";

  return (
    <div className="mb-8">
      <p className="text-white/40 text-xs text-center mb-4 tracking-wide uppercase">{label}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {profiles.map((saved) => {
          const initials = getInitials(saved.name);
          const color = getAvatarColor(saved.name);
          const isHovered = hoveredId === saved.id;

          return (
            <div
              key={saved.id}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              onMouseEnter={() => setHoveredId(saved.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(saved.profile)}
            >
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg transition-all duration-200 ${
                    isHovered ? "ring-2 ring-white/60 scale-105" : "ring-1 ring-white/20"
                  }`}
                >
                  {saved.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={saved.avatarUrl} alt={saved.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                {isHovered && (
                  <button
                    onClick={(e) => handleDelete(e, saved.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white text-xs transition-all"
                    title={lang === "he" ? "מחק פרופיל" : "Delete profile"}
                  >
                    ✕
                  </button>
                )}
              </div>
              <span className="text-white/60 text-xs max-w-[64px] text-center truncate group-hover:text-white/90 transition-colors">
                {saved.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
