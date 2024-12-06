import { EditorProps } from "document-model/document";
import {
  AtlasScopeState,
  AtlasScopeAction,
  AtlasScopeLocalState,
  actions,
} from "../../document-models/atlas-scope";
import { useState, useEffect } from "react";
import { Button } from "@powerhousedao/design-system";
import { Status, GlobalTag } from "../../document-models/atlas-scope/gen/schema";

export type IProps = EditorProps<
  AtlasScopeState,
  AtlasScopeAction,
  AtlasScopeLocalState
>;

const ARTICLE_LINKS = [
  { id: "A.1.1", title: "Spirit of the Atlas | ARTICLE" },
  { id: "A.1.2", title: "Atlas Documents | ARTICLE" },
  { id: "A.1.3", title: "Governance Accessibility | ARTICLE" },
  { id: "A.1.4", title: "Alignment Conservers | ARTICLE" },
  { id: "A.1.5", title: "Aligned Delegates | ARTICLE" },
  { id: "A.1.6", title: "Facilitators | ARTICLE" },
  { id: "A.1.7", title: "Professional Ecosystem Actors | ARTICLE" },
  { id: "A.1.8", title: "Emergency Response System | ARTICLE" },
  { id: "A.1.9", title: "Sky Core Governance Security | ARTICLE" },
  { id: "A.1.10", title: "Weekly Governance Cycle | ARTICLE" },
  { id: "A.1.11", title: "Monthly Governance Cycle | ARTICLE" },
  { id: "A.1.12", title: "Updating Active Data | ARTICLE" },
  { id: "A.1.13", title: "Scope Bootstrapping | ARTICLE" },
];

const NAV_TABS = ["Governance", "Support", "Stability", "Protocol", "Accessibility"] as const;
type TabType = typeof NAV_TABS[number];

const SCOPE_CONTENT = {
  Governance: {
    description: "The Governance Scope regulates the governance processes and balance of power of the Sky Ecosystem. The Governance Scope must ensure that the resilient equilibrium of Sky Governance remains protected against all potential direct and indirect threats.",
    articles: ARTICLE_LINKS
  },
  Support: {
    description: "// No description yet, it will be displayed here by fetching the live data from the Notion API.",
    articles: [] // Will be populated with Support related articles
  },
  Stability: {
    description: "// No description yet, it will be displayed here by fetching the live data from the Notion API.",
    articles: [] // Will be populated with Stability related articles
  },
  Protocol: {
    description: "// No description yet, it will be displayed here by fetching the live data from the Notion API.",
    articles: [] // Will be populated with Protocol related articles
  },
  Accessibility: {
    description: "// No description yet, it will be displayed here by fetching the live data from the Notion API.",
    articles: [] // Will be populated with Accessibility related articles
  }
} as const;

interface ScopeStatus {
  [key: string]: Status;
}

const TAG_OPTIONS = [
  "RECURSIVE_IMPROVEMENT",
  "SCOPE_ADVISOR",
  "DAO_TOOLKIT",
  "PURPOSE_SYSTEM",
  "ML_-_LOW_PRIORITY",
  "EXTERNAL_REFERENCE",
  "ML_-_DEFER",
  "SUBDAO_INCUBATION",
  "V1_-_MIP",
  "ML_-__HIGH_PRIORITY",
  "ECOSYSTEM_INTELLIGENCE",
  "LEGACY_TERM_-_USE_APPROVED",
  "CAIS",
  "INTERNAL_REFERENCE",
  "FACILITATORDAO",
  "ML_-__MED_PRIORITY",
  "AVC",
  "P0_HUB_ENTRY_NEEDED",
  "ANON_WORKFORCE",
  "NEWCHAIN",
  "ML_-_SUPPORT._DOCS_NEEDED",
  "SUBDAO_REWARDS",
  "TWO-STAGE_BRIDGE"
] as const;

interface ScopeTags {
  [key: string]: GlobalTag[];
}

export default function Editor(props: IProps) {
  const { document, dispatch } = props;
  const {
    state: { global: state },
  } = document;

  const [name, setName] = useState(state.name || "");
  const [newPhid, setNewPhid] = useState("");
  const [newTag, setNewTag] = useState("");
  const [provenance, setProvenance] = useState(state.provenance || "");
  const [scopeStatuses, setScopeStatuses] = useState<ScopeStatus>(() => {
    // Initialize with default status for each scope
    return NAV_TABS.reduce((acc, tab) => ({
      ...acc,
      [tab]: state.masterStatus[0] || "PLACEHOLDER"
    }), {});
  });
  const [activeTab, setActiveTab] = useState<TabType>("Governance");
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [scopeTags, setScopeTags] = useState<ScopeTags>(() => {
    // Initialize with empty tags array for each scope
    return NAV_TABS.reduce((acc, tab) => ({
      ...acc,
      [tab]: state.globalTags || []
    }), {});
  });
  const [pendingStatus, setPendingStatus] = useState<ScopeStatus>(() => ({
    ...scopeStatuses
  }));
  const [pendingTags, setPendingTags] = useState<ScopeTags>(() => ({
    ...scopeTags
  }));

  // Update pending state when switching tabs
  useEffect(() => {
    setPendingStatus(scopeStatuses);
    setPendingTags(scopeTags);
  }, [activeTab]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingStatus(prev => ({
      ...prev,
      [activeTab]: e.target.value as Status
    }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTag = e.target.value as GlobalTag;
    if (newTag && !pendingTags[activeTab].includes(newTag)) {
      setPendingTags(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], newTag]
      }));
    }
  };

  const removeTag = (tagToRemove: GlobalTag) => {
    setPendingTags(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    // Update the actual state with pending changes
    setScopeStatuses(pendingStatus);
    setScopeTags(pendingTags);
    
    dispatch(
      actions.updateScope({
        id: document.id,
        name,
        docNo: state.docNo,
        content: state.content,
        masterStatus: [pendingStatus[activeTab] as Status],
        globalTags: pendingTags[activeTab],
        originalContextData: state.originalContextData,
        provenance,
      })
    );
    
    setShowCheckmark(true);
    setTimeout(() => {
      setShowCheckmark(false);
    }, 2000);
  };

  // Function to check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return (
      pendingStatus[activeTab] !== scopeStatuses[activeTab] ||
      JSON.stringify(pendingTags[activeTab]) !== JSON.stringify(scopeTags[activeTab])
    );
  };

  // Update tab click handler to check for unsaved changes
  const handleTabClick = (newTab: TabType) => {
    if (hasUnsavedChanges()) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Would you like to apply these changes before switching tabs?"
      );
      
      if (confirmSwitch) {
        // Apply changes then switch
        setScopeStatuses(pendingStatus);
        setScopeTags(pendingTags);
        
        dispatch(
          actions.updateScope({
            id: document.id,
            name,
            docNo: state.docNo,
            content: state.content,
            masterStatus: [pendingStatus[activeTab] as Status],
            globalTags: pendingTags[activeTab],
            originalContextData: state.originalContextData,
            provenance,
          })
        );

        setShowCheckmark(true);
        setTimeout(() => {
          setShowCheckmark(false);
        }, 2000);
      } else {
        // Discard changes
        setPendingStatus(scopeStatuses);
        setPendingTags(scopeTags);
      }
    }
    
    setActiveTab(newTab);
  };

  const addPhid = () => {
    if (newPhid) {
      dispatch(
        actions.updateScope({
          id: document.id,
          name,
          docNo: state.docNo,
          content: state.content,
          masterStatus: [scopeStatuses[activeTab] as Status],
          globalTags: state.globalTags,
          originalContextData: [...state.originalContextData, newPhid],
          provenance,
        })
      );
      setNewPhid("");
    }
  };

  const removePhid = (phidToRemove: string) => {
    dispatch(
      actions.updateScope({
        id: document.id,
        name,
        docNo: state.docNo,
        content: state.content,
        masterStatus: [scopeStatuses[activeTab] as Status],
        globalTags: state.globalTags,
        originalContextData: state.originalContextData.filter(p => p !== phidToRemove),
        provenance,
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        padding: "8px 16px",
        borderBottom: "1px solid #ccc"
      }}>
        <div style={{ display: "flex", gap: "16px" }}>
          {NAV_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              style={{
                padding: "4px 8px",
                border: "none",
                background: tab === activeTab ? "#f0f0f0" : "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: tab === activeTab ? "500" : "normal",
                borderRadius: "4px"
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button style={{ fontSize: "14px", padding: "4px 8px" }}>
          Export
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, padding: "20px", gap: "24px" }}>
        {/* Left Sidebar */}
        <div style={{ width: "300px" }}>
          {SCOPE_CONTENT[activeTab].articles.length > 0 ? (
            SCOPE_CONTENT[activeTab].articles.map(article => (
              <div
                key={article.id}
                style={{
                  padding: "8px",
                  fontSize: "14px",
                  color: "#666",
                  cursor: "pointer"
                }}
              >
                {article.title}
              </div>
            ))
          ) : (
            <div style={{ 
              padding: "8px", 
              fontSize: "14px", 
              color: "#666",
              fontStyle: "italic" 
            }}>
              No articles yet. Articles for {activeTab} scope will be displayed here.
            </div>
          )}
        </div>

        {/* Right Content */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "18px", marginBottom: "16px", fontWeight: "normal" }}>
            SKY ATLAS | {activeTab.toUpperCase()} SCOPE
          </h1>

          {/* Description Box */}
          <div style={{ 
            padding: "12px", 
            border: "1px solid #000", 
            marginBottom: "24px",
            fontSize: "14px",
            color: SCOPE_CONTENT[activeTab].description.startsWith("//") ? "#666" : "inherit",
            fontStyle: SCOPE_CONTENT[activeTab].description.startsWith("//") ? "italic" : "normal"
          }}>
            {SCOPE_CONTENT[activeTab].description}
          </div>

          {/* Form Fields */}
          <div style={{ display: "flex", gap: "24px" }}>
            {/* Left Column */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Provenance</div>
                <input
                  type="text"
                  value={provenance}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProvenance(e.target.value)}
                  placeholder="https://notion.so/p0hub..."
                  style={{ 
                    width: "100%", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Name</div>
                <input
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="GOVERNANCE SCOPE"
                  style={{ 
                    width: "100%", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Original Context Data</div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                  {state.originalContextData.map((phid) => (
                    <div 
                      key={phid}
                      style={{ 
                        padding: "2px 8px",
                        border: "1px solid #000",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "14px",
                        backgroundColor: "#fff"
                      }}
                    >
                      {phid}
                      <button 
                        onClick={() => removePhid(phid)}
                        style={{ 
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0 2px",
                          fontSize: "14px"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  value={newPhid}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhid(e.target.value)}
                  placeholder="Add new PHIDs"
                  style={{ 
                    width: "100%", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPhid();
                    }
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Status</div>
                <select
                  value={pendingStatus[activeTab]}
                  onChange={handleStatusChange}
                  style={{ 
                    width: "160px", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    backgroundColor: "#fff"
                  }}
                >
                  <option value="PLACEHOLDER">PLACEHOLDER</option>
                  <option value="PROVISIONAL">PROVISIONAL</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="DEFERRED">DEFERRED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Global Tags</div>
                <div style={{ 
                  display: "flex", 
                  gap: "8px", 
                  marginBottom: "8px", 
                  flexWrap: "wrap",
                  minHeight: pendingTags[activeTab].length ? "32px" : "0"
                }}>
                  {pendingTags[activeTab].map((tag) => (
                    <div 
                      key={tag}
                      style={{ 
                        padding: "2px 8px",
                        border: "1px solid #000",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        borderRadius: "2px"
                      }}
                    >
                      {tag.replace(/_/g, ' ').replace(/-/g, ' ')}
                      <button 
                        onClick={() => removeTag(tag)}
                        style={{ 
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0 2px",
                          fontSize: "14px",
                          marginLeft: "4px"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  value=""
                  onChange={handleTagChange}
                  style={{ 
                    width: "100%", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    backgroundColor: "#fff"
                  }}
                >
                  <option value="">Add another tag</option>
                  {TAG_OPTIONS
                    .filter(tag => !pendingTags[activeTab].includes(tag as GlobalTag))
                    .map(tag => (
                      <option key={tag} value={tag}>
                        {tag.replace(/_/g, ' ').replace(/-/g, ' ')}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button 
              onClick={handleSubmit}
              style={{ 
                padding: "4px 12px",
                fontSize: "14px",
                border: "1px solid #2196f3",
                background: "#2196f3",
                color: "white",
                cursor: "pointer",
                marginTop: "24px",
                transition: "all 0.2s ease",
                transform: "scale(1)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#1976d2";
                e.currentTarget.style.borderColor = "#1976d2";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#2196f3";
                e.currentTarget.style.borderColor = "#2196f3";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.95)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Apply Changes
            </button>
            {showCheckmark && (
              <span style={{ 
                color: "#4caf50", 
                fontSize: "20px",
                marginTop: "24px"
              }}>
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
