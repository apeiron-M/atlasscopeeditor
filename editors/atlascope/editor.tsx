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
  const [provenanceLinks, setProvenanceLinks] = useState<string[]>(
    state.provenance ? [state.provenance] : []
  );
  const [newProvenance, setNewProvenance] = useState("");
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
  const [isEditingProvenance, setIsEditingProvenance] = useState(false);

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
        provenance: provenanceLinks[provenanceLinks.length - 1] || "",
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
        // Apply changes first
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
            provenance: provenanceLinks[provenanceLinks.length - 1] || "",
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
    
    // Always switch to new tab after handling changes
    setActiveTab(newTab);
  };

  const validateInput = (input: string): boolean => {
    // Accept both PHID formats and regular document names
    return input.startsWith('phd://') || 
           input.startsWith('phd:eip155:') || 
           input.trim().length > 0;  // Allow any non-empty string
  };

  const formatUrl = (input: string): string => {
    if (input.startsWith('phd://')) {
      return input;
    } else if (input.startsWith('phd:eip155:')) {
      return `https://etherscan.io/address/${input.split(':')[3]}`;
    }
    return '#'; // For regular document names, no link
  };

  const addPhid = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newPhid.trim()) {
      const updatedPhids = [...state.originalContextData, newPhid.trim()];
      
      dispatch(
        actions.updateScope({
          id: document.id,
          name,
          docNo: state.docNo,
          content: state.content,
          masterStatus: [scopeStatuses[activeTab] as Status],
          globalTags: state.globalTags,
          originalContextData: updatedPhids,
          provenance: provenanceLinks[provenanceLinks.length - 1] || "",
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
        provenance: provenanceLinks[provenanceLinks.length - 1] || "",
      })
    );
  };

  const handleArticleAreaClick = () => {
    window.alert(
      "Articles cannot be manually added here. They are automatically populated from the Notion API based on the scope's content structure."
    );
  };

  const handleProvenanceSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newProvenance.trim()) {
      setProvenanceLinks([...provenanceLinks, newProvenance.trim()]);
      setNewProvenance("");
      
      dispatch(
        actions.updateScope({
          id: document.id,
          name,
          docNo: state.docNo,
          content: state.content,
          masterStatus: [scopeStatuses[activeTab] as Status],
          globalTags: state.globalTags,
          originalContextData: state.originalContextData,
          provenance: newProvenance.trim(),
        })
      );
    }
  };

  const removeProvenance = (linkToRemove: string) => {
    const updatedLinks = provenanceLinks.filter(link => link !== linkToRemove);
    setProvenanceLinks(updatedLinks);
    
    dispatch(
      actions.updateScope({
        id: document.id,
        name,
        docNo: state.docNo,
        content: state.content,
        masterStatus: [scopeStatuses[activeTab] as Status],
        globalTags: state.globalTags,
        originalContextData: state.originalContextData,
        provenance: updatedLinks[updatedLinks.length - 1] || "",
      })
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a temporary "Copied!" message here if desired
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
        <div 
          style={{ 
            width: "300px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: "2px",
            cursor: "not-allowed",
            height: "fit-content",
            alignSelf: "flex-start"
          }}
          onClick={handleArticleAreaClick}
        >
          {SCOPE_CONTENT[activeTab].articles.length > 0 ? (
            SCOPE_CONTENT[activeTab].articles.map(article => (
              <div
                key={article.id}
                style={{
                  padding: "8px",
                  fontSize: "14px",
                  color: "#666",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "not-allowed",
                  wordBreak: "break-word"
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
              fontStyle: "italic",
              cursor: "not-allowed"
            }}>
              No articles yet. Articles for {activeTab} scope will be displayed here when fetched from Notion API.
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
            border: "1px solid #ccc", 
            marginBottom: "24px",
            fontSize: "14px",
            color: SCOPE_CONTENT[activeTab].description.startsWith("//") ? "#666" : "inherit",
            fontStyle: SCOPE_CONTENT[activeTab].description.startsWith("//") ? "italic" : "normal",
            backgroundColor: "#f5f5f5",
            cursor: "not-allowed"
          }}>
            {SCOPE_CONTENT[activeTab].description}
          </div>

          {/* Form Fields */}
          <div style={{ display: "flex", gap: "24px" }}>
            {/* Left Column */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Provenance</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {provenanceLinks.map((link, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 8px",
                        border: "1px solid #ccc",
                        borderRadius: "2px",
                      }}
                    >
                      <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2196f3",
                          textDecoration: "none",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {link}
                      </a>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => copyToClipboard(link)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Copy link"
                        >
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </button>
                        <button
                          onClick={() => removeProvenance(link)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Remove link"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={newProvenance}
                    onChange={(e) => setNewProvenance(e.target.value)}
                    onKeyDown={handleProvenanceSubmit}
                    placeholder="Add a provenance URL..."
                    style={{ 
                      width: "100%", 
                      padding: "4px 8px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Name</div>
                <input
                  type="text"
                  value={name}
                  readOnly
                  placeholder="GOVERNANCE SCOPE"
                  style={{ 
                    width: "100%", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>Original Context Data</div>
                <div style={{ 
                  display: "flex", 
                  gap: "8px", 
                  marginBottom: "8px", 
                  flexWrap: "wrap",
                  minHeight: state.originalContextData.length ? "32px" : "0"
                }}>
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
                        backgroundColor: "#fff",
                        borderRadius: "2px"
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
                          fontSize: "14px",
                          marginLeft: "4px"
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
                  onKeyDown={addPhid}
                  placeholder="Add phd:// or phd:eip155:..."
                  style={{ 
                    width: "100%", 
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    fontSize: "14px"
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
                  <option value="">Add a new tag</option>
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
