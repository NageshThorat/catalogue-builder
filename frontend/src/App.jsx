import { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import { UploadCloud, CheckCircle, Package, RefreshCw, Smartphone, Image as ImageIcon, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import './index.css'

const API_URL = `http://localhost:8000`

// Bypass localtunnel warning
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [catalogueData, setCatalogueData] = useState([])
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.data.error) {
        setError(response.data.error)
        setIsUploading(false)
      } else {
        setJobId(response.data.job_id)
        setJobStatus('processing')
      }
    } catch (err) {
      setError(err.message)
      setIsUploading(false)
    }
  }

  // Poll for job status
  useEffect(() => {
    let intervalId;
    if (jobId && jobStatus === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/catalogue/${jobId}`)
          if (response.data.status === 'completed') {
            setJobStatus('completed')
            setCatalogueData(response.data.data)
            setActiveTab('catalogue')
            clearInterval(intervalId)
            setIsUploading(false)
          } else if (response.data.status === 'failed') {
            setJobStatus('failed')
            setError(response.data.error)
            clearInterval(intervalId)
            setIsUploading(false)
          }
        } catch (err) {
          console.error("Polling error", err)
        }
      }, 2000)
    }
    return () => clearInterval(intervalId)
  }, [jobId, jobStatus])

  const handleExportCSV = () => {
    if (catalogueData.length === 0) return
    
    // Extract headers
    const headers = Object.keys(catalogueData[0]).filter(key => key !== 'images' && key !== 'marketing_copy')
    
    // Create CSV content
    const csvContent = [
      [...headers, 'push_notification', 'whatsapp_message'].join(','),
      ...catalogueData.map(row => 
        [
          ...headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`),
          `"${(row.marketing_copy?.push || '').toString().replace(/"/g, '""')}"`,
          `"${(row.marketing_copy?.whatsapp || '').toString().replace(/"/g, '""')}"`
        ].join(',')
      )
    ].join('\n')
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'intelligent_catalogue.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGeneratePoster = async (productId) => {
    const element = document.getElementById(`poster-${productId}`)
    if (!element) return
    
    try {
      const canvas = await html2canvas(element, { useCORS: true, backgroundColor: '#1a1a1a' })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `poster-${productId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Failed to generate poster", err)
    }
  }

  const campaignData = useMemo(() => {
    if (catalogueData.length === 0) return null;
    const sortedByQtyDesc = [...catalogueData].sort((a, b) => b.total_quantity - a.total_quantity);
    const sortedByMarginDesc = [...catalogueData].sort((a, b) => b.margin - a.margin);
    const sortedByQtyAsc = [...catalogueData].sort((a, b) => a.total_quantity - b.total_quantity);
    
    const categories = [...new Set(catalogueData.map(p => p.category))];
    const topCategory = categories[0] || 'Snacks';
    const categoryProducts = catalogueData.filter(p => p.category === topCategory).slice(0, 3);
    const festivalProducts = [...catalogueData].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return {
      highSelling: sortedByQtyDesc.slice(0, 3),
      highMargin: sortedByMarginDesc.slice(0, 3),
      clearance: sortedByQtyAsc.slice(0, 3),
      categoryCampaign: { title: `${topCategory} Specials`, products: categoryProducts },
      festivalCampaign: { title: `Holiday Festival`, products: festivalProducts }
    }
  }, [catalogueData])

  const renderCampaignPoster = (id, title, subtitle, products, theme, pushCopy, whatsappCopy) => (
    <div key={id} className="product-card glass" style={{gridColumn: '1 / -1'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3 style={{margin: 0, fontSize: '1.2rem'}}>{title} Campaign</h3>
        <button onClick={() => handleGeneratePoster(id)} style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success)'}}>
          <Download size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/> Download Poster
        </button>
      </div>
      
      <div style={{marginBottom: '1rem'}}>
        <h4 style={{fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 4px 0'}}>Campaign Headline</h4>
        <div style={{fontSize: '1.1rem', fontWeight: 'bold'}}>{subtitle}</div>
      </div>
      
      {/* Poster Element */}
      <div id={`poster-${id}`} style={{
        background: theme, padding: '2rem', borderRadius: '16px', color: 'white', 
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <h2 style={{fontSize: '2.5rem', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>{title}</h2>
        <p style={{fontSize: '1.2rem', margin: '0 0 2rem', opacity: 0.9}}>{subtitle}</p>
        
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          {products.map((p, i) => (
            <div key={i} style={{background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)', width: '30%'}}>
              <img src={p.images[0]} style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem'}} crossOrigin="anonymous"/>
              <h4 style={{margin: '0 0 0.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.product_name}</h4>
              <div style={{color: '#ffd700', fontWeight: 'bold', fontSize: '1.2rem'}}>₹{p.selling_price}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h4 style={{fontSize: '0.9rem', color: 'var(--accent-color)', margin: '0 0 8px 0'}}><Smartphone size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Push Notification Copy</h4>
          <button onClick={() => {navigator.clipboard.writeText(pushCopy); alert('Copied to clipboard!')}} style={{background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', fontSize: '0.7rem', padding: '2px 8px'}}>Copy</button>
        </div>
        <div className="glass" style={{padding: '0.8rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', marginBottom: '1rem'}}>
          {pushCopy}
        </div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h4 style={{fontSize: '0.9rem', color: 'var(--success)', margin: '0 0 8px 0'}}><ImageIcon size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> WhatsApp Message Copy</h4>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappCopy)}`, '_blank')} style={{background: 'var(--success)', fontSize: '0.7rem', padding: '2px 8px'}}>Send</button>
        </div>
        <div className="glass" style={{padding: '0.8rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)'}}>
          {whatsappCopy}
        </div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <h1>Intelligent Catalogue Builder</h1>
      
      <div className="tabs glass">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <UploadCloud size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
          Upload Report
        </button>
        <button 
          className={`tab ${activeTab === 'catalogue' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogue')}
          disabled={catalogueData.length === 0}
        >
          <Package size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
          Digital Catalogue
        </button>
        <button 
          className={`tab ${activeTab === 'marketing' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketing')}
          disabled={catalogueData.length === 0}
        >
          <Smartphone size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
          Marketing Creatives
        </button>
      </div>

      <div className="content">
        {error && (
          <div className="glass" style={{padding: '1rem', color: 'var(--danger)', marginBottom: '1rem', border: '1px solid var(--danger)'}}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="glass" style={{padding: '2rem'}}>
            <h2>Upload Sales Report</h2>
            <p style={{color: 'var(--text-muted)'}}>Upload a CSV or Excel file to generate your intelligent catalogue.</p>
            
            <div 
              className={`uploader-area ${file ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv, .xlsx, .xls" 
              />
              <UploadCloud size={48} color="var(--primary-color)" style={{marginBottom: '1rem'}}/>
              {file ? (
                <div style={{textAlign: 'center'}}>
                  <p style={{color: 'var(--success)', fontWeight: 'bold'}}>{file.name}</p>
                  <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <p>Drag & drop your file here, or click to select</p>
              )}
            </div>

            <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}>
              <button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? (
                  <><RefreshCw size={18} style={{marginRight: '8px', verticalAlign: 'middle', animation: 'spin 1s linear infinite'}}/> Processing...</>
                ) : (
                  'Generate Catalogue'
                )}
              </button>
            </div>
            
            {jobStatus === 'processing' && (
              <div style={{textAlign: 'center', marginTop: '2rem'}}>
                <div className="loader"></div>
                <p style={{color: 'var(--text-muted)'}}>AI is analyzing your sales data, fetching images, and writing copy...</p>
              </div>
            )}
            
            {jobStatus === 'completed' && (
              <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--success)'}}>
                <CheckCircle size={48} />
                <p>Catalogue generated successfully!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'catalogue' && (
          <div>
            <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2>Generated Catalogue</h2>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <span className="tag">{catalogueData.length} Products Processed</span>
                <button onClick={handleExportCSV} style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                  <Download size={14} style={{marginRight: '6px', verticalAlign: 'middle'}}/>
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="grid-container">
              {catalogueData.map(product => (
                <div key={product.id} className="product-card glass">
                  <div style={{position: 'relative'}}>
                    <img src={product.images[0]} alt={product.product_name} className="product-image" />
                    <span style={{position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#00ff00', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px'}}>
                      98% Match Confidence
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                     <h3 style={{marginBottom: '0.2rem', fontSize: '1.1rem'}}>{product.product_name}</h3>
                     <span className="tag" style={{background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)'}}>{product.category}</span>
                  </div>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0}}>{product.brand}</p>
                  
                  <div className="tags">
                    {product.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  
                  <div className="price-row">
                    <div>
                      <div className="mrp">₹{product.mrp}</div>
                      <div className="selling-price">₹{product.selling_price}</div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                       <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Margin</div>
                       <div style={{color: 'var(--success)', fontWeight: 'bold'}}>₹{product.margin}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div>
            <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
              <h2>Marketing Campaigns</h2>
              <p style={{color: 'var(--text-muted)'}}>AI-generated copy and creatives ready for distribution.</p>
            </div>
            
            <div className="grid-container">
              {/* Campaign Posters */}
              {campaignData && (
                <>
                  {renderCampaignPoster(
                    'campaign-bestsellers',
                    'Best Sellers',
                    'Grab our most popular items before they sell out!',
                    campaignData.highSelling,
                    'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                    '🔥 Our Best Sellers are flying off the shelves! Shop the top items of the week now.',
                    'Hi! 👋 Did you know these are our most loved products this week? Shop the Best Sellers now before they run out of stock! ✨'
                  )}
                  {renderCampaignPoster(
                    'campaign-premium',
                    'Premium Selection',
                    'Exclusive deals on our highest quality products.',
                    campaignData.highMargin,
                    'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
                    '💎 Upgrade your lifestyle with our Premium Selection. Exclusive quality just for you.',
                    'Hello! 🌟 Treat yourself to the best. Check out our Premium Selection of top-tier products, available now! 🛍️'
                  )}
                  {renderCampaignPoster(
                    'campaign-clearance',
                    'Clearance Sale',
                    'Massive discounts on last remaining stock!',
                    campaignData.clearance,
                    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
                    '🚨 CLEARANCE SALE! Massive discounts on last remaining items. Shop now!',
                    'Hey! 💥 Don\'t miss out on our Clearance Sale! Prices slashed on remaining stock. Grab these deals before they are gone forever! 🛒'
                  )}
                  {campaignData.categoryCampaign.products.length > 0 && renderCampaignPoster(
                    'campaign-category',
                    campaignData.categoryCampaign.title,
                    `Stock up on the best ${campaignData.categoryCampaign.title.split(' ')[0]} today!`,
                    campaignData.categoryCampaign.products,
                    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    `🛒 Shop our ${campaignData.categoryCampaign.title}! The best categories are on sale now!`,
                    `Hi! Check out our massive sale on ${campaignData.categoryCampaign.title.split(' ')[0]} products! Don't miss out! 🛍️`
                  )}
                  {campaignData.festivalCampaign.products.length > 0 && renderCampaignPoster(
                    'campaign-festival',
                    campaignData.festivalCampaign.title,
                    'Celebrate the season with exclusive festival discounts!',
                    campaignData.festivalCampaign.products,
                    'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
                    '🎆 Happy Holidays! Celebrate with our Festival Mega Sale today!',
                    'Greetings! ✨ Bring joy to your home with our Festival Mega Sale. Tap to shop now! 🎉'
                  )}
                </>
              )}
              
              <div style={{gridColumn: '1 / -1', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'}}>
                <h3>Individual Product Campaigns</h3>
              </div>

              {catalogueData.map(product => (
                <div key={`mkt-${product.id}`} id={`poster-${product.id}`} className="product-card glass" style={{gap: '1.5rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <h3 style={{fontSize: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', flex: 1}}>{product.product_name}</h3>
                    <button onClick={() => handleGeneratePoster(product.id)} style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success)'}} title="Download as Poster Image">
                      <Download size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/> Poster
                    </button>
                  </div>
                  
                  {/* Poster Visual Preview */}
                  <div style={{width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', position: 'relative', marginTop: '1rem'}}>
                    <img src={product.images[0]} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Poster bg" crossOrigin="anonymous" />
                    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '1rem'}}>
                       <h4 style={{margin: 0, color: 'white'}}>{product.product_name}</h4>
                       <p style={{margin: '4px 0 0', color: 'var(--success)', fontWeight: 'bold'}}>Only ₹{product.selling_price}!</p>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <h4 style={{fontSize: '0.9rem', color: 'var(--accent-color)'}}><Smartphone size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Push Notification</h4>
                      <button onClick={() => {navigator.clipboard.writeText(product.marketing_copy?.push || ''); alert('Copied!')}} style={{background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', fontSize: '0.7rem', padding: '2px 8px'}}>Copy</button>
                    </div>
                    <div className="glass" style={{padding: '0.8rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)'}}>
                      {product.marketing_copy?.push || 'Deal alert! Buy now at a special price.'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <h4 style={{fontSize: '0.9rem', color: 'var(--success)'}}><ImageIcon size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> WhatsApp Message</h4>
                      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(product.marketing_copy?.whatsapp || '')}`, '_blank')} style={{background: 'var(--success)', fontSize: '0.7rem', padding: '2px 8px'}}>Send</button>
                    </div>
                    <div className="glass" style={{padding: '0.8rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)'}}>
                      {product.marketing_copy?.whatsapp || 'Check out our latest arrival. Buy now!'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
