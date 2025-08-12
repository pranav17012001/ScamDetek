import React, { useState, useEffect } from "react";
import "malaysia-state-flag-icon-css/css/flag-icon.min.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  Legend as PieLegend,
} from "recharts";
import axios from "axios";
import { FaMars, FaVenus } from "react-icons/fa"; // Import React Icons
import sessionStorage from "../utils/sessionStorage";

const states = [
  "Overall",
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "W.P. Kuala Lumpur",
];

const stateFlagCodes = {
  Johor: "jhr",
  Kedah: "kdh",
  Kelantan: "ktn",
  Melaka: "mlk",
  "Negeri Sembilan": "nsn",
  Pahang: "phg",
  Perak: "prk",
  Perlis: "pls",
  "Pulau Pinang": "png",
  Sabah: "sbh",
  Sarawak: "swk",
  Selangor: "sgr",
  Terengganu: "trg",
  "W.P. Kuala Lumpur": "kul",
};

const MalaysiaDashboard = () => {
  const [crimesByState, setCrimesByState] = useState([]);
  const [victimsByAge, setVictimsByAge] = useState([]);
  const [victimsByGenderAge, setVictimsByGenderAge] = useState([]);
  const [selectedState, setSelectedState] = useState(states[0]);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [filteredVictimsByAge, setFilteredVictimsByAge] = useState([]);
  const [filteredVictimsByGenderAge, setFilteredVictimsByGenderAge] = useState([]);
  const [totalLossRM, setTotalLossRM] = useState(0);
  const [victimsCount, setVictimsCount] = useState(0);
  const [casesCount, setCasesCount] = useState(0);
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);
  const [newsData, setNewsData] = useState([]);
  const [topAffectedYear, setTopAffectedYear] = useState(null);
  const [mostCommonAgeGroup, setMostCommonAgeGroup] = useState("");
  const [caseTypeData, setCaseTypeData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [crimeCasesByState, setCrimeCasesByState] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all three datasets in parallel
  useEffect(() => {
    setLoading(true);
    
    // Check session storage for all three datasets
    const storedCrimes = sessionStorage.get("malaysia-crimes-by-state");
    const storedAge = sessionStorage.get("malaysia-victims-by-age");
    const storedGenderAge = sessionStorage.get("malaysia-victims-by-gender-age");

    if (storedCrimes && storedAge && storedGenderAge) {
      setCrimesByState(storedCrimes);
      setVictimsByAge(storedAge);
      setVictimsByGenderAge(storedGenderAge);
      setLoading(false);
      return;
    }

    // If any data is missing from session storage, fetch all
    Promise.all([
      axios.get("/api/online-crimes-by-state"),
      axios.get("/api/victims-by-age-group"),
      axios.get("/api/victims-by-gender-and-age")
    ]).then(([crimesRes, ageRes, genderAgeRes]) => {
      const crimesData = crimesRes.data;
      const ageData = ageRes.data;
      const genderAgeData = genderAgeRes.data;

      // Store in session storage
      sessionStorage.set("malaysia-crimes-by-state", crimesData);
      sessionStorage.set("malaysia-victims-by-age", ageData);
      sessionStorage.set("malaysia-victims-by-gender-age", genderAgeData);

      setCrimesByState(crimesData);
      setVictimsByAge(ageData);
      setVictimsByGenderAge(genderAgeData);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching Malaysia online crimes data:", error);
      setCrimesByState([]);
      setVictimsByAge([]);
      setVictimsByGenderAge([]);
      setLoading(false);
    });
  }, []);

  // Filtering and aggregation logic
  useEffect(() => {
    // Normalize function for state
    const normalize = (str) => str ? str.trim().toLowerCase().replace(/[^a-z0-9]/gi, "") : "";
    const selectedStateNormalized = normalize(selectedState);

    // Filter by state (or all)
    const filteredCrimes = selectedState === "Overall"
      ? crimesByState
      : crimesByState.filter(row => normalize(row.state) === selectedStateNormalized);
    setFilteredCrimes(filteredCrimes);

    const filteredVictimsByAge = selectedState === "Overall"
      ? victimsByAge
      : victimsByAge.filter(row => normalize(row.state) === selectedStateNormalized);
    setFilteredVictimsByAge(filteredVictimsByAge);

    const filteredVictimsByGenderAge = selectedState === "Overall"
      ? victimsByGenderAge
      : victimsByGenderAge.filter(row => normalize(row.state) === selectedStateNormalized);
    setFilteredVictimsByGenderAge(filteredVictimsByGenderAge);

    // --- Aggregations ---
    // Total Loss
    setTotalLossRM(filteredCrimes.reduce((sum, row) => sum + (parseFloat(row.financial_losses_rm) || 0), 0));
    // Total Cases
    setCasesCount(filteredCrimes.reduce((sum, row) => sum + (parseInt(row.number_of_cases, 10) || 0), 0));
    // Victims Count (sum all victims by age)
    setVictimsCount(filteredVictimsByAge.reduce((sum, row) => sum + (parseInt(row.number_of_victims, 10) || 0), 0));

    // Gender Data (pie chart)
    const maleVictims = filteredVictimsByGenderAge
      .filter(row => row.gender && row.gender.toLowerCase() === "male")
      .reduce((sum, row) => sum + (parseInt(row.number_of_victims, 10) || 0), 0);
    const femaleVictims = filteredVictimsByGenderAge
      .filter(row => row.gender && row.gender.toLowerCase() === "female")
      .reduce((sum, row) => sum + (parseInt(row.number_of_victims, 10) || 0), 0);
    setGenderData([
      { name: "Male", value: maleVictims },
      { name: "Female", value: femaleVictims },
    ]);

    // Chart Data for Number of Cases across Years
    const years = ["2021", "2022", "2023"];
    const chartData = years.map(year => {
      const totalCasesForYear = filteredCrimes
        .filter(row => String(row.year) === String(year))
        .reduce((sum, row) => sum + (parseInt(row.number_of_cases, 10) || 0), 0);
      return { year, cases: totalCasesForYear };
    });
    setChartData(chartData);

    // Top affected year (by victims)
    const victimsByYear = {};
    filteredVictimsByAge.forEach(row => {
      const year = row.year;
      const victims = parseInt(row.number_of_victims, 10) || 0;
      victimsByYear[year] = (victimsByYear[year] || 0) + victims;
    });
    const mostAffectedYear = Object.entries(victimsByYear).reduce(
      (prev, curr) => (curr[1] > prev[1] ? curr : prev),
      [null, 0]
    );
    setTopAffectedYear(mostAffectedYear[0]);

    // Most common age group (by victims)
    const ageGroups = [">=61", "15-20", "21-30", "31-40", "41-50", "51-60"];
    let maxVictims = 0;
    let mostCommonGroup = "";
    ageGroups.forEach(ageGroup => {
      const ageGroupVictims = filteredVictimsByAge
        .filter(row => row.age_group === ageGroup)
        .reduce((sum, row) => sum + (parseInt(row.number_of_victims, 10) || 0), 0);
      if (ageGroupVictims > maxVictims) {
        maxVictims = ageGroupVictims;
        mostCommonGroup = ageGroup;
      }
    });
    setMostCommonAgeGroup(mostCommonGroup);

    // Case type data (for donut chart)
    const caseTypes = [
      "e-Commerce",
      "e-Finance",
      "Love scam",
      "Non-existent investments",
      "Non-existent loans",
      "Telecommunication crime",
    ];
    const caseTypeData = caseTypes.map(type => {
      const casesForType = filteredCrimes
        .filter(row => row.online_crime === type)
        .reduce((sum, row) => sum + (parseInt(row.number_of_cases, 10) || 0), 0);
      return { name: type, value: casesForType };
    });
    setCaseTypeData(caseTypeData);

    // Age group data for bar chart (overall only)
    if (selectedState === "Overall") {
      // Group by state and age group
      const grouped = {};
      victimsByAge.forEach(row => {
        if (!grouped[row.state]) {
          grouped[row.state] = {
            "15-20": 0,
            "21-30": 0,
            "31-40": 0,
            "41-50": 0,
            "51-60": 0,
            ">=61": 0,
          };
        }
        if (ageGroups.includes(row.age_group)) {
          grouped[row.state][row.age_group] += parseInt(row.number_of_victims, 10) || 0;
        }
      });
      const ageGroupChartData = Object.keys(grouped).map(state => ({
        state,
        ...grouped[state],
      }));
      setAgeGroupData(ageGroupChartData);
    }

    // Crime cases by state (overall only)
    if (selectedState === "Overall") {
      // Group by state and crime type
      const grouped = {};
      crimesByState.forEach(row => {
        if (!grouped[row.state]) grouped[row.state] = {};
        grouped[row.state][row.online_crime] =
          (grouped[row.state][row.online_crime] || 0) + (parseInt(row.number_of_cases, 10) || 0);
      });
      const formattedData = Object.entries(grouped).map(([state, crimes]) => ({
        state,
        ...crimes,
      }));
      setCrimeCasesByState(formattedData);
    }
  }, [crimesByState, victimsByAge, victimsByGenderAge, selectedState]);

  // Fetch scam news via our FastAPI proxy
  useEffect(() => {
    // build the query term (map special state names)
    let query =
      selectedState === "Overall"
        ? "Malaysia scam"
        : selectedState === "W.P. Kuala Lumpur"
        ? "Kuala Lumpur scam"
        : selectedState === "Pulau Pinang"
        ? "Penang scam"
        : `${selectedState} scam`;

    const storageKey = `malaysia-news-${query}`;
    
    // Check session storage first
    const storedNews = sessionStorage.get(storageKey);
    if (storedNews) {
      setNewsData(storedNews);
      return;
    }

    // If not in session storage, fetch from API
    axios
      .get(`/api/news?country=${encodeURIComponent(query)}`)
      .then(({ data }) => {
        const articles = data.articles || [];
        setNewsData(articles);
        // Store in session storage
        sessionStorage.set(storageKey, articles);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        setNewsData([]);
      });
  }, [selectedState]);

  const flagCode = stateFlagCodes[selectedState];

  // Financial Loss Sorting
  const financialLossesByState = states
    .filter((state) => state !== "Overall")
    .map((state) => {
      const stateData = crimesByState.filter((row) => row.state === state);
      const totalLoss = stateData.reduce(
        (sum, row) => sum + (parseFloat(row.financial_losses_rm) || 0),
        0
      );
      return { state, totalLoss };
    });

  // Sorting by Total Loss in descending order
  const sortedFinancialLosses = financialLossesByState.sort(
    (a, b) => b.totalLoss - a.totalLoss
  );

  if (loading) {
    return (
      <div style={{ color: '#00BFFF', fontSize: 32, textAlign: 'center', marginTop: 80 }}>
        Loading Malaysia Cyber Attack Dashboard...
      </div>
    );
  }

  return (
    <div
      className="malaysia-content"
      style={{ overflow: "auto", maxWidth: "100%" }}
    >
      <div className="view-switcher" style={{ alignItems: "center" }}>
        <label
          htmlFor="state-select"
          style={{
            color: "white",
            marginRight: 8,
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Select State:
        </label>
        <select
          id="state-select"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{
            padding: "6px 8px",
            borderRadius: "4px",
            border: "1px solid #00AAFF",
            background: "#1a1a1a",
            color: "white",
            fontSize: "18px",
          }}
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

       {/* Back Button: Only show when not viewing "Overall" */}
  {selectedState !== "Overall" && (
    <div
      className="back-button"
      style={{
        cursor: "pointer",
        color: "#00BFFF",
        fontWeight: "bold",
        fontSize: "18px",
        margin: "20px 0 2px 0",
        display: "inline-block"
      }}
      onClick={() => setSelectedState("Overall")}
    >
      ← Back to Overall
    </div>
  )}

      {/* For the "Overall" State */}
      {selectedState === "Overall" && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "30px",
              fontWeight: "bold",
              display: "inline",
            }}
          >
            Here are the Overall Statistics of{" "}
          </h3>
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "35px",
              fontWeight: "bold",
              display: "inline",
            }}
          >
            Malaysia
          </h3>
        </div>
      )}

      {selectedState === "Overall" && (
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            color: "white",
            fontSize: "20px",
          }}
        >
          <p>
            Below are the statistics from{" "}
            <span style={{ fontWeight: "bold" }}>2021-2023</span>, sourced from{" "}
            <span style={{ fontWeight: "bold" }}>
              Department of Statistics Malaysia (DOSM)
            </span>
            . These insights showcase the affected age groups, financial losses,
            and crime categories reported across
            <span
              style={{
                fontWeight: "bold",
                fontSize: "23px",
                color: "#00BFFF",
                marginLeft: "5px",
              }}
            >
              Malaysia
            </span>{" "}
            in these years.
            <span style={{ fontWeight: "bold" }}>
              {" "}
              Real-time scam-related news
            </span>{" "}
            across Malaysia is also provided, powered by a live API feed.
          </p>
        </div>
      )}

      {selectedState === "Overall" && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "30px",
            width: "100%",
          }}
        >
          {/* Left Section for Overall Financial Loss */}
          <div
            style={{
              width: "calc(45% - 20px)",
              minWidth: "350px",
              maxWidth: "900px",
              backgroundColor: "#222",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              marginTop: "20px",
              marginBottom: "20px",
              marginLeft: "10px",
              marginRight: "10px",
              overflow: "auto",
              flex: "1 1 350px",
            }}
          >
            <h3
              style={{
                color: "#00BFFF",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Overall Financial Loss Ranks by State
            </h3>
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "linear-gradient(45deg, #1a1a1a, #333)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#333",
                      color: "#00BFFF",
                      fontSize: "16px",
                      textAlign: "center",
                    }}
                  >
                    <th
                      style={{
                        padding: "15px",
                        borderBottom: "2px solid #444",
                        borderTopLeftRadius: "10px",
                        width: "15%",
                      }}
                    >
                      Rank
                    </th>
                    <th
                      style={{
                        padding: "15px",
                        borderBottom: "2px solid #444",
                        width: "50%",
                      }}
                    >
                      State
                    </th>
                    <th
                      style={{
                        padding: "15px",
                        borderBottom: "2px solid #444",
                        borderTopRightRadius: "10px",
                        width: "35%",
                      }}
                    >
                      Total Loss (RM)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFinancialLosses.map((item, index) => (
                    <tr
                      key={item.state}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#333" : "#444",
                        color: "white",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#555")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor =
                          index % 2 === 0 ? "#333" : "#444")
                      }
                    >
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #444",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #444",
                        }}
                      >
                        <span
                          className={`malaysia-state-flag-icon malaysia-state-flag-icon-${
                            stateFlagCodes[item.state]
                          }`}
                          style={{
                            marginRight: "8px",
                            verticalAlign: "middle",
                            width: "24px",
                            height: "35px",
                          }}
                        ></span>
                        {item.state}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #444",
                          whiteSpace: "nowrap",
                        }}
                      >
                        RM {item.totalLoss.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Section for Online Crimes Summary by State */}
          <div
            style={{
              width: "calc(53% - 20px)",
              maxWidth: "1200px",
              backgroundColor: "#222",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              marginTop: "20px",
              marginBottom: "20px",
              marginLeft: "10px",
              marginRight: "10px",
              overflow: "auto",
              flex: "1 1 650px",
            }}
          >
            <h3
              style={{
                color: "#00BFFF",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Online Crimes Cases by State
            </h3>
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "linear-gradient(45deg, #1a1a1a, #333)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#333",
                      color: "#00BFFF",
                      fontSize: "15px",
                      textAlign: "center",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        borderTopLeftRadius: "10px",
                        width: "12%",
                      }}
                    >
                      State
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        width: "12%",
                      }}
                    >
                      e-Commerce
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        width: "12%",
                      }}
                    >
                      e-Finance
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        width: "12%",
                      }}
                    >
                      Love Scam
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        width: "17%",
                      }}
                    >
                      Non-existent Investments
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        width: "17%",
                      }}
                    >
                      Non-existent Loans
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        borderBottom: "2px solid #444",
                        borderTopRightRadius: "10px",
                        width: "18%",
                      }}
                    >
                      Telecom Crime
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {crimeCasesByState.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#333" : "#444",
                        color: "white",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#555")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor =
                          index % 2 === 0 ? "#333" : "#444")
                      }
                    >
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                        }}
                      >
                        <span
                          className={`malaysia-state-flag-icon malaysia-state-flag-icon-${
                            stateFlagCodes[item.state]
                          }`}
                          style={{
                            marginRight: "5px",
                            verticalAlign: "middle",
                            width: "20px",
                            height: "14px",
                          }}
                        ></span>
                        {item.state}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                          fontSize: "14px",
                        }}
                      >
                        {item["e-Commerce"] || 0}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                          fontSize: "14px",
                        }}
                      >
                        {item["e-Finance"] || 0}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                          fontSize: "14px",
                        }}
                      >
                        {item["Love scam"] || 0}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                          fontSize: "14px",
                        }}
                      >
                        {item["Non-existent investments"] || 0}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                          fontSize: "14px",
                        }}
                      >
                        {item["Non-existent loans"] || 0}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          borderBottom: "1px solid #444",
                          fontSize: "14px",
                        }}
                      >
                        {item["Telecommunication crime"] || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedState === "Overall" && (
        <div style={{ width: "100%", marginTop: "30px", overflow: "auto" }}>
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Victims by Age Group for each State
          </h3>
          <div
            className="chart-container"
            style={{
              width: "100%",
              minWidth: "600px",
              margin: "0 auto",
              background: "#222",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            {" "}
            {/* Box for Bar Chart */}
            <ResponsiveContainer width="100%" height={600} aspect={undefined}>
              <BarChart data={ageGroupData}>
                <CartesianGrid stroke="none" />
                <XAxis dataKey="state" />
                <YAxis domain={[0, 7000]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="15-20" stackId="a" fill="#8884d8" name="15-20" />
                <Bar dataKey="21-30" stackId="a" fill="#82ca9d" name="21-30" />
                <Bar dataKey="31-40" stackId="a" fill="#ffc658" name="31-40" />
                <Bar dataKey="41-50" stackId="a" fill="#ff7300" name="41-50" />
                <Bar dataKey="51-60" stackId="a" fill="#ff6b6b" name="51-60" />
                <Bar dataKey=">=61" stackId="a" fill="#d0d0d0" name=">=61" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Adjusted Position for State Stats Title and Flag */}
      {selectedState !== "Overall" && flagCode && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "30px",
              fontWeight: "bold",
              display: "inline",
            }}
          >
            Here are the Statistics for{" "}
          </h3>
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "35px",
              fontWeight: "bold",
              display: "inline",
            }}
          >
            {selectedState}
          </h3>
          <span
            className={`malaysia-state-flag-icon malaysia-state-flag-icon-${flagCode}`}
            style={{
              display: "inline-block",
              width: 48,
              height: 32,
              marginLeft: "10px", // Space between state name and flag
              verticalAlign: "middle", // Proper alignment with text
            }}
          />
        </div>
      )}

      {/* Displaying the description */}
      {selectedState !== "Overall" && (
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            color: "white",
            fontSize: "20px",
          }}
        >
          <p>
            Below are the statistics from{" "}
            <span style={{ fontWeight: "bold" }}>2021-2023</span>, sourced from{" "}
            <span style={{ fontWeight: "bold" }}>
              Department of Statistics Malaysia (DOSM)
            </span>
            . These insights showcase the growth of online crimes, commonly
            affected age groups, financial losses, and crime categories reported
            in
            <span
              style={{
                fontWeight: "bold",
                fontSize: "23px",
                color: "#00BFFF",
                marginLeft: "5px",
              }}
            >
              {selectedState}
            </span>{" "}
            during these years.
            <span style={{ fontWeight: "bold" }}>
              {" "}
              Real-time scam related news
            </span>{" "}
            in {selectedState} is also provided, powered by a live API feed.
          </p>
        </div>
      )}

      {/* Stats Layout */}
      {selectedState !== "Overall" && (
        <div className="stats-container">
          <div className="stat-card orange">
            <h3>Total Financial Loss (RM)</h3>
            <p>RM {totalLossRM.toLocaleString()}</p>
            <span className="icon">💰</span>
          </div>
          <div className="stat-card red">
            <h3>Number of Victims</h3>
            <p>{victimsCount.toLocaleString()}</p>
            <span className="icon">👥</span>
          </div>
          <div className="stat-card green">
            <h3>Number of Cases</h3>
            <p>{casesCount.toLocaleString()}</p>
            <span className="icon">📊</span>
          </div>
        </div>
      )}

      {/* Line Chart for Number of Cases across Years */}
      {selectedState !== "Overall" && chartData.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "65%",
              padding: "20px",
              background: "#222",
              borderRadius: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3
              style={{
                color: "#00BFFF",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Number of Cases across Years
            </h3>
            <ResponsiveContainer width="100%" height={400} aspect={undefined}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#00AAFF"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart for Gender Distribution */}
          {selectedState !== "Overall" &&
            genderData.some((item) => item.value > 0) && (
              <div
                style={{
                  width: "33%",
                  padding: "20px",
                  background: "#222",
                  borderRadius: "20px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <h3
                  style={{
                    color: "#00BFFF",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  Gender Distribution of Victims
                </h3>
                <ResponsiveContainer
                  width="100%"
                  height={300}
                  aspect={undefined}
                >
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#00BFFF"
                      label
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.name === "Male" ? "#00BFFF" : "#FF6347"}
                        />
                      ))}
                    </Pie>
                    <PieTooltip />
                    <PieLegend
                      iconSize={20}
                      width={150}
                      height={50}
                      layout="horizontal"
                      verticalAlign="top"
                      align="left"
                      wrapperStyle={{ padding: "5px 0", color: "#00BFFF" }}
                      content={({ payload }) => (
                        <ul
                          style={{ listStyle: "none", margin: 0, padding: 0 }}
                        >
                          {payload.map(({ payload: d }, index) => {
                            const isMale = d.name === "Male";
                            return (
                              <li
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {isMale ? (
                                  <FaMars
                                    style={{
                                      marginRight: 10,
                                      color: "#00BFFF",
                                      fontSize: 20,
                                    }}
                                  />
                                ) : (
                                  <FaVenus
                                    style={{
                                      marginRight: 10,
                                      color: "#FF6347",
                                      fontSize: 20,
                                    }}
                                  />
                                )}
                                <span
                                  style={{
                                    color: isMale ? "#00BFFF" : "#FF6347",
                                  }}
                                >
                                  {d.name}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      )}

      {/* Additional Statistics Box */}
      {selectedState !== "Overall" && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#222",
            borderRadius: "10px",
          }}
        >
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Additional Statistics
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                width: "45%",
                backgroundColor: "#333",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <h3
                style={{
                  color: "#00BFFF",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                Most Affected Age Group in {selectedState}
              </h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {mostCommonAgeGroup}
              </p>
            </div>
            <div
              style={{
                width: "45%",
                backgroundColor: "#333",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <h3
                style={{
                  color: "#00BFFF",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                Most Affected Year in {selectedState}
              </h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {topAffectedYear}
              </p>
            </div>
          </div>

          {/* Donut Chart for Cases Distribution */}
          <div
            style={{
              marginTop: "30px",
              backgroundColor: "#333",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3
              style={{
                color: "#00BFFF",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Cases Distribution in {selectedState}
            </h3>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  width: "25%",
                  paddingLeft: "40px",
                  paddingTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {caseTypeData.map((entry, index) => {
                  const itemColor =
                    index === 0
                      ? "#00E3F9" // e-Commerce
                      : index === 1
                      ? "#C77DFF" // e-Finance
                      : index === 2
                      ? "#FF4F81" // Love scam
                      : index === 3
                      ? "#3EFFB9" // Non-existent investments
                      : index === 4
                      ? "#FFA447" // Non-existent loans
                      : "#FFF94C"; // Telecommunication crime

                  return (
                    <div
                      key={`legend-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: itemColor,
                          marginRight: "15px",
                          borderRadius: "4px",
                        }}
                      ></div>
                      <span
                        style={{
                          color: itemColor,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {entry.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 右侧饼图 */}
              <div style={{ width: "75%" }}>
                <ResponsiveContainer
                  width="100%"
                  height={450}
                  aspect={undefined}
                >
                  <PieChart>
                    <Pie
                      data={caseTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#00BFFF"
                      labelLine={false}
                      label={({ percent, name }) => {
                        const percentage = (percent * 100).toFixed(1);
                        return `${percentage}%`;
                      }}
                    >
                      {caseTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "#00E3F9" // e-Commerce
                              : index === 1
                              ? "#C77DFF" // e-Finance
                              : index === 2
                              ? "#FF4F81" // Love scam
                              : index === 3
                              ? "#3EFFB9" // Non-existent investments
                              : index === 4
                              ? "#FFA447" // Non-existent loans
                              : "#FFF94C" // Telecommunication crime
                          }
                        />
                      ))}
                    </Pie>
                    <PieTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Scam News for Overall */}
      {selectedState === "Overall" && (
        <div
          style={{
            marginTop: "30px",
            color: "#00BFFF",
            fontSize: "24px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Latest Scam News in Malaysia
          </h3>
          <div
            style={{ marginTop: "20px", maxWidth: "800px", margin: "0 auto" }}
          >
            {newsData.length > 0 ? (
              newsData.map((article, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px",
                    background: "#333",
                    marginBottom: "10px",
                    borderRadius: "8px",
                  }}
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={{
                        width: "200px",
                        height: "auto",
                        borderRadius: "8px",
                        marginRight: "15px",
                      }}
                    />
                  )}
                  <div>
                    {/* Make the headline clickable */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00BFFF",
                        fontSize: "18px",
                        margin: "0 0 10px 0",
                        textDecoration: "none",
                      }}
                    >
                      {article.title}
                    </a>
                    {/* Change description text to white */}
                    <p style={{ fontSize: "14px", color: "white" }}>
                      {article.description}
                    </p>
                    {/* Add the "Read More" link */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00BFFF",
                        fontSize: "14px",
                        marginTop: "10px",
                        display: "inline-block",
                      }}
                    >
                      Read More
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p>No latest news available for Malaysia.</p>
            )}
          </div>

          {/* Citation for News API */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
              color: "white",
            }}
          >
            <p>
              News sourced from{" "}
              <a
                href="https://newsapi.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#00BFFF", textDecoration: "none" }}
              >
                NewsAPI.org
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Latest Scam News for Selected State */}
      {selectedState !== "Overall" && (
        <div
          style={{
            marginTop: "30px",
            color: "#00BFFF",
            fontSize: "24px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "#00BFFF",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Latest Scam News in {selectedState}
          </h3>
          <div
            style={{ marginTop: "20px", maxWidth: "800px", margin: "0 auto" }}
          >
            {newsData.length > 0 ? (
              newsData.map((article, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px",
                    background: "#333",
                    marginBottom: "10px",
                    borderRadius: "8px",
                  }}
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={{
                        width: "200px",
                        height: "auto",
                        borderRadius: "8px",
                        marginRight: "15px",
                      }}
                    />
                  )}
                  <div>
                    {/* Make the headline clickable */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00BFFF",
                        fontSize: "18px",
                        margin: "0 0 10px 0",
                        textDecoration: "none",
                      }}
                    >
                      {article.title}
                    </a>
                    {/* Change description text to white */}
                    <p style={{ fontSize: "14px", color: "white" }}>
                      {article.description}
                    </p>
                    {/* Add the "Read More" link */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00BFFF",
                        fontSize: "14px",
                        marginTop: "10px",
                        display: "inline-block",
                      }}
                    >
                      Read More
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p>No latest news available for {selectedState}.</p>
            )}
          </div>

          {/* Citation for News API */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
              color: "white",
            }}
          >
            <p>
              News sourced from{" "}
              <a
                href="https://newsapi.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#00BFFF", textDecoration: "none" }}
              >
                NewsAPI.org
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MalaysiaDashboard;
