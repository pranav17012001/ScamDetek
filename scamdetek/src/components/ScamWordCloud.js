import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

// Static list of scam keywords
const SCAM_KEYWORDS = [
  "#1",
  "100% more",
  "100% free",
  "100% satisfied",
  "Additional income",
  "Be your own boss",
  "Best price",
  "Big bucks",
  "Billion",
  "Cash bonus",
  "Casino",
  "Cheap",
  "Claims",
  "Clearance",
  "Compare rates",
  "Credit card offers",
  "Cures",
  "Dear friend",
  "Discount",
  "Double your income",
  "Earn $",
  "Earn extra cash",
  "Eliminate debt",
  "Extra income",
  "Fast cash",
  "Financial freedom",
  "Free access",
  "Free consultation",
  "Free gift",
  "Free hosting",
  "Free info",
  "Free investment",
  "Free membership",
  "Free money",
  "Free offer",
  "Free preview",
  "Free quote",
  "Free sample",
  "Free trial",
  "Full refund",
  "Get out of debt",
  "Get paid",
  "Giveaway",
  "Guaranteed",
  "Increase sales",
  "Incredible deal",
  "Investment",
  "Join millions",
  "Lifetime",
  "Loans",
  "Lose weight",
  "Lottery",
  "Lower rates",
  "Make money",
  "Million dollars",
  "Miracle",
  "Money back",
  "No credit check",
  "No fees",
  "No obligation",
  "No purchase necessary",
  "Offer expires",
  "Opportunity",
  "Order now",
  "Outstanding values",
  "Password",
  "Passwords",
  "Prize",
  "Promise",
  "Pure profit",
  "Quick cash",
  "Refinance",
  "Removal",
  "Requires initial investment",
  "Risk free",
  "Satisfaction guaranteed",
  "Save $",
  "Save big money",
  "Save up to",
  "Score",
  "Serious cash",
  "Subject to credit",
  "They keep your money",
  "This isn't a scam",
  "Undisclosed",
  "Unsecured credit",
  "Urgent",
  "Vacation offers",
  "Valuble offer",
  "We honor all credit cards",
  "Weekend getaway",
  "What are you waiting for",
  "While supplies last",
  "Will not believe your eyes",
  "Winner",
  "Winning",
  "You have been selected",
  "Account update",
  "Action required",
  "Banking alert",
  "Verify account",
  "Hacked",
  "Virus",
  "Security breach",
  "Government funds",
  "keuntungan",
  "promo",
  "promosi",
  "menang",
  "memenangi",
  "menangi hadiah",
  "menang hamper",
  "memenangi hadiah",
  "berjaya menangi",
  "berjaya memenangi",
  "berjaya menang",
  "berpeluang",
  "meraih hadiah",
  "meraih wang tunai",
  "bertuah",
  "percuma",
  "skim cepat kaya",
  "pulangan lumayan",
  "jutawan segera",
  "modal kecil",
  "pelaburan berisiko rendah",
  "pendapatan pasif",
  "pendapatan tetap",
  "kerja dari rumah",
  "peluang keemasan",
  "jangan ketinggalan",
  "daftar sekarang",
  "klik di sini",
  "hubungi sekarang",
  "tawaran eksklusif",
  "harga terendah",
  "tiada pelaburan diperlukan",
  "tiada yuran tersembunyi",
  "loteri",
  "jackpot",
  "pinjaman mudah",
  "pinjaman tanpa jaminan",
  "hadiah bernilai",
  "bonus wang tunai",
  "geran",
  "dana percuma",
  "proses cepat",
  "bayaran segera"
];

const ScamWordCloud = () => {
  const cloudRef = useRef(null);
  
  useEffect(() => {
    // Convert the static SCAM_KEYWORDS array into the format needed for the word cloud
    const words = SCAM_KEYWORDS.map(keyword => ({
      text: keyword,
      value: Math.floor(Math.random() * 30) + 15 // Random value between 15-45 for varied sizes
    }));
    
    if (!cloudRef.current) return;
    
    // Clear any existing cloud
    d3.select(cloudRef.current).selectAll("*").remove();
    
    const containerWidth = cloudRef.current.clientWidth || 1400;
    const containerHeight = cloudRef.current.clientHeight || 700;
    
    // Create the layout with more compact spacing and reduced size
    const layout = cloud()
      .size([containerWidth, containerHeight])
      .words(words)
      .padding(8) // Increased padding to prevent overlap
      // Allow vertical text with a 90 degree rotation
      .rotate(() => {
        // 90% horizontal, 10% vertical text to improve readability
        return Math.random() > 0.9 ? 90 : 0;
      })
      .fontSize(d => Math.min(d.value * 0.7, 40)) // Further reduced font size scaling
      .on("end", draw);
    
    layout.start();
    
    // Function to draw the words
    function draw(words) {
      // Calculate scaling factor to ensure all words fit
      const boundingBox = words.reduce((box, word) => {
        const wordWidth = word.text.length * (word.size * 0.6); // approximate width
        const wordHeight = word.size;
        // Track the furthest points
        box.minX = Math.min(box.minX, word.x - wordWidth/2);
        box.maxX = Math.max(box.maxX, word.x + wordWidth/2);
        box.minY = Math.min(box.minY, word.y - wordHeight/2);
        box.maxY = Math.max(box.maxY, word.y + wordHeight/2);
        return box;
      }, { minX: 0, maxX: 0, minY: 0, maxY: 0 });
      
      // Add some padding
      const padding = 20;
      const cloudWidth = boundingBox.maxX - boundingBox.minX + (padding * 2);
      const cloudHeight = boundingBox.maxY - boundingBox.minY + (padding * 2);
      
      // Calculate scale to fit everything
      const scaleX = containerWidth / cloudWidth;
      const scaleY = containerHeight / cloudHeight;
      const scale = Math.min(scaleX, scaleY, 1) * 0.85; // Use 85% of available space
      
      // Add tech-themed background
      const svg = d3.select(cloudRef.current)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("class", "word-cloud");
      
      // Add grid pattern
      const defs = svg.append("defs");
      
      // Create a subtle grid pattern
      const pattern = defs.append("pattern")
        .attr("id", "grid")
        .attr("width", 30)
        .attr("height", 30)
        .attr("patternUnits", "userSpaceOnUse");
      
      pattern.append("path")
        .attr("d", "M 30 0 L 0 0 0 30")
        .attr("fill", "none")
        .attr("stroke", "#1e2a45")
        .attr("stroke-width", "0.5");
      
      // Add pattern as background
      svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "url(#grid)");
      
      const group = svg.append("g")
        .attr("transform", `translate(${containerWidth/2},${containerHeight/2}) scale(${scale})`);
      
      // Updated color palette with requested colors
      const color = d3.scaleOrdinal()
        .domain([0, words.length])
        .range([
          "#4FD1C5", // Main teal color
          "#68D391", // Green
          "#CBD5E0", // Light grey
          "#A0AEC0", // Medium grey
          "#718096", // Darker grey
          "#2D3748", // Very dark grey
          "#4ABDC5", // Slightly bluer teal
          "#38B2AC", // Darker teal
          "#81E6D9", // Lighter teal
          "#ffffff", // White
          "#ffff00", // Black
          "#5DDEB7"  // Teal-green mix
        ]);
        
      const fontFamilies = [
        "'Courier New', monospace",
        "Arial, sans-serif",
        "Verdana, sans-serif"
      ];
        
      group.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", (d, i) => {
          // Assign different font families for variation
          if (i % 3 === 0) return fontFamilies[0];
          if (i % 3 === 1) return fontFamilies[1];
          return fontFamilies[2];
        })
        .style("font-weight", (d, i) => i % 5 === 0 ? "bold" : "normal")
        .style("fill", (d, i) => color(i % 12))
        .style("opacity", 0.9)
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .attr("class", "word-cloud-text")
        .style("letter-spacing", "0.5px")
        .text(d => d.text)
        .on("mouseover", function() {
          d3.select(this)
            .transition()
            .duration(150)
            .style("filter", "brightness(1.5) drop-shadow(0 0 4px currentColor)")
            .style("stroke", "#ffffff")
            .style("stroke-width", "0.5px")
            .style("letter-spacing", "1px")
            .style("text-shadow", "0 0 6px currentColor");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style("filter", "brightness(1)")
            .style("stroke-width", "0px")
            .style("letter-spacing", "0.5px")
            .style("text-shadow", "none");
        });
        
      // Add a few subtle circuit-like lines
      const nodes = words.filter((d, i) => i % 8 === 0).slice(0, 6);
      
      for (let i = 0; i < nodes.length - 1; i++) {
        group.append("line")
          .attr("x1", nodes[i].x)
          .attr("y1", nodes[i].y)
          .attr("x2", nodes[i+1].x)
          .attr("y2", nodes[i+1].y)
          .attr("stroke", "#4FD1C5")
          .attr("stroke-width", 0.8)
          .attr("stroke-dasharray", "3,5")
          .attr("opacity", 0.2);
      }
    }
  }, []);
  
  return (
    <div className="word-cloud-embedded">
      <div className="word-cloud-header">
        <h2>
          <span className="tech-icon">⚠️</span> Scam Threat Keywords <span className="tech-icon">⚠️</span>
        </h2>
      </div>
      <div className="word-cloud-container" ref={cloudRef}></div>
      <div className="word-cloud-instructions">
        <p>Beware of these possible scam keywords. They may indicate fraudulent communication or potential cyber threats.</p>
        <div className="tech-footer">
          <span style={{opacity: 0.7}}></span>
          <div className="source-attribution">Source: <a href="https://www.activecampaign.com/blog/spam-words" target="_blank" rel="noopener noreferrer">ActiveCampaign Blog</a></div>
        </div>
      </div>
    </div>
  );
};

export default ScamWordCloud;