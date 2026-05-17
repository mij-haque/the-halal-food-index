"use client";

import { useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/contexts/theme-context";

// ─── Settings nav sections ────────────────────────────────────────────────────

const SECTIONS = ["General", "Appearance", "API Keys", "Account"] as const;
type Section = (typeof SECTIONS)[number];

// ─── Input helpers ────────────────────────────────────────────────────────────

function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-border last:border-0">
      <div className="sm:w-48 shrink-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      defaultValue={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-sm h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
    />
  );
}

// ─── Theme card ───────────────────────────────────────────────────────────────

function ThemeCard({
  label,
  Icon,
  preview,
  selected,
  onSelect,
}: {
  value?: Theme;
  label: string;
  Icon: React.FC<{ className?: string }>;
  preview: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-150 text-left",
        selected
          ? "border-emerald-500 shadow-md shadow-emerald-500/10"
          : "border-border hover:border-foreground/20"
      )}
    >
      {/* Preview */}
      <div className="h-24 w-full overflow-hidden">{preview}</div>

      {/* Label */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-background">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        {selected && (
          <span className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500">
            <Check className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </div>
    </button>
  );
}

function LightPreview() {
  return (
    <div className="h-full bg-[#F8FAFC] p-2 flex gap-1.5">
      <div className="w-8 bg-white border border-[#E2E8F0] rounded-md flex flex-col gap-1 p-1">
        {[40, 24, 24, 24].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-[#E2E8F0]" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 rounded-md bg-white border border-[#E2E8F0]" />
          ))}
        </div>
        <div className="flex-1 rounded-md bg-white border border-[#E2E8F0]" />
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="h-full bg-[#0F0F0F] p-2 flex gap-1.5">
      <div className="w-8 bg-[#111111] border border-[#2A2A2A] rounded-md flex flex-col gap-1 p-1">
        {[40, 24, 24, 24].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-[#2A2A2A]" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 rounded-md bg-[#1A1A1A] border border-[#2A2A2A]" />
          ))}
        </div>
        <div className="flex-1 rounded-md bg-[#1A1A1A] border border-[#2A2A2A]" />
      </div>
    </div>
  );
}

function SystemPreview() {
  return (
    <div className="h-full flex">
      <div className="flex-1 bg-[#F8FAFC] p-2 flex flex-col gap-1">
        <div className="h-2 w-10 rounded bg-[#E2E8F0]" />
        <div className="flex-1 rounded bg-white border border-[#E2E8F0]" />
      </div>
      <div className="flex-1 bg-[#0F0F0F] p-2 flex flex-col gap-1">
        <div className="h-2 w-10 rounded bg-[#2A2A2A]" />
        <div className="flex-1 rounded bg-[#1A1A1A] border border-[#2A2A2A]" />
      </div>
    </div>
  );
}

const THEME_CARDS: {
  value: Theme;
  label: string;
  Icon: React.FC<{ className?: string }>;
  Preview: React.FC;
}[] = [
  { value: "light", label: "Light", Icon: Sun, Preview: LightPreview },
  { value: "dark", label: "Dark", Icon: Moon, Preview: DarkPreview },
  { value: "system", label: "System", Icon: Monitor, Preview: SystemPreview },
];

// ─── API key row ──────────────────────────────────────────────────────────────

function ApiKeyRow({
  label,
  description,
  placeholder,
}: {
  label: string;
  description: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");

  return (
    <FormField label={label} description={description}>
      <div className="flex items-center gap-2 max-w-sm">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="h-9 px-3 rounded-lg border border-border bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </FormField>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("General");
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your admin panel preferences and integrations
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Settings nav */}
        <nav className="sm:w-44 shrink-0">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
            {SECTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSection(s)}
                className={cn(
                  "flex w-full items-center h-10 px-4 text-sm transition-colors border-b border-border last:border-0",
                  activeSection === s
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </nav>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm px-5">
            {/* General */}
            {activeSection === "General" && (
              <div>
                <div className="py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">General Settings</h3>
                </div>
                <FormField
                  label="Site Name"
                  description="Displayed in the browser tab and metadata"
                >
                  <TextInput value="The Halal Food Index" placeholder="Site name" />
                </FormField>
                <FormField
                  label="Contact Email"
                  description="Used for admin notifications"
                >
                  <TextInput value="admin@halalfoodindex.co.uk" type="email" />
                </FormField>
                <FormField
                  label="Default City"
                  description="Default city for new listings"
                >
                  <TextInput value="Manchester" />
                </FormField>
                <FormField
                  label="Listings Per Page"
                  description="Number of listings shown per page in the admin table"
                >
                  <select className="h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </FormField>
              </div>
            )}

            {/* Appearance */}
            {activeSection === "Appearance" && (
              <div>
                <div className="py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
                </div>
                <div className="py-5">
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how the admin panel looks. System follows your OS setting.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {THEME_CARDS.map(({ value, label, Icon, Preview }) => (
                      <ThemeCard
                        key={value}
                        value={value}
                        label={label}
                        Icon={Icon}
                        preview={<Preview />}
                        selected={theme === value}
                        onSelect={() => setTheme(value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeSection === "API Keys" && (
              <div>
                <div className="py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
                </div>
                <ApiKeyRow
                  label="Google Places API Key"
                  description="Used for address autocomplete and place data enrichment"
                  placeholder="AIzaSy..."
                />
                <ApiKeyRow
                  label="Apify API Token"
                  description="Used for scraping jobs in the Pipeline"
                  placeholder="apify_api_..."
                />
                <ApiKeyRow
                  label="Mapbox Token"
                  description="Used for embedded map previews in the slide panel"
                  placeholder="pk.eyJ1..."
                />
              </div>
            )}

            {/* Account */}
            {activeSection === "Account" && (
              <div>
                <div className="py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Account</h3>
                </div>
                <FormField label="Name" description="Your display name in the admin panel">
                  <TextInput value="Mij" />
                </FormField>
                <FormField label="Email" description="Your login email">
                  <TextInput value="admin@halalfoodindex.co.uk" type="email" />
                </FormField>
                <FormField label="Role">
                  <span className="inline-flex items-center h-9 px-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Admin
                  </span>
                </FormField>
                <FormField label="Password" description="Change your password">
                  <button
                    type="button"
                    className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Change password
                  </button>
                </FormField>
              </div>
            )}
          </div>

          {/* Save button */}
          {activeSection !== "Account" && (
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="h-9 px-5 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
