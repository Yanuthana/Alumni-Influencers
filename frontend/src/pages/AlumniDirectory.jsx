import React, { useState, useEffect, useRef } from 'react';
import { getAlumniDirectory } from '../services/alumni-directory-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

ChartJS.register(ArcElement, Tooltip, Legend);

function AlumniDirectory() {
    // Beginner-friendly: separate state variables instead of a single object
    const [programme, setProgramme] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [industry, setIndustry] = useState('');
    
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef(null);

    // Beginner-friendly: regular function instead of arrow function
    async function loadAlumni() {
        setLoading(true);
        try {
            // Put filters into an object manually
            let filters = {
                programme: programme,
                graduation_year: graduationYear,
                industry: industry
            };
            let data = await getAlumniDirectory(filters);
            setAlumni(data);
        } catch (error) {
            console.error('Failed to fetch alumni', error);
        }
        setLoading(false);
    }

    // Run once when the page loads
    useEffect(function() {
        loadAlumni();
    }, []);

    // Explicit change handlers for each input
    function handleProgrammeChange(e) {
        setProgramme(e.target.value);
    }

    function handleGraduationYearChange(e) {
        setGraduationYear(e.target.value);
    }

    function handleIndustryChange(e) {
        setIndustry(e.target.value);
    }

    function handleSearch(e) {
        e.preventDefault();
        loadAlumni();
    }

    // Beginner-friendly: using classic for-loops instead of map/forEach/reduce
    function exportCSV() {
        if (alumni.length === 0) {
            return;
        }
        
        let headers = ['First Name', 'Last Name', 'Email', 'Degrees', 'Industry'];
        let csvRows = [];
        
        let headerString = headers.join(',');
        csvRows.push(headerString);

        for (let i = 0; i < alumni.length; i++) {
            let a = alumni[i];
            
            let degreesString = "";
            if (a.degrees) {
                let degArr = [];
                for (let j = 0; j < a.degrees.length; j++) {
                    degArr.push(a.degrees[j].title);
                }
                degreesString = degArr.join(", ");
            }

            let industryString = "";
            if (a.employment_history) {
                let indArr = [];
                for (let k = 0; k < a.employment_history.length; k++) {
                    indArr.push(a.employment_history[k].company);
                }
                industryString = indArr.join(", ");
            }

            let row = [
                a.first_name,
                a.second_name,
                a.email,
                '"' + degreesString + '"',
                '"' + industryString + '"'
            ];
            
            let rowString = row.join(',');
            csvRows.push(rowString);
        }

        let allRowsString = csvRows.join('\n');
        let blob = new Blob([allRowsString], { type: 'text/csv' });
        let url = window.URL.createObjectURL(blob);
        
        let aElement = document.createElement('a');
        aElement.href = url;
        aElement.download = 'alumni_report.csv';
        aElement.click();
        
        window.URL.revokeObjectURL(url);
    }

    function exportPDF() {
        if (alumni.length === 0) {
            return;
        }
        
        let doc = new jsPDF();
        doc.text("Alumni Directory Report", 14, 15);
        
        let tableColumn = ["Name", "Email", "Degrees", "Industry"];
        let tableRows = [];

        for (let i = 0; i < alumni.length; i++) {
            let a = alumni[i];
            
            let fullName = a.first_name;
            if (a.second_name) {
                fullName = fullName + " " + a.second_name;
            }

            let degreesString = "";
            if (a.degrees) {
                let degArr = [];
                for (let j = 0; j < a.degrees.length; j++) {
                    degArr.push(a.degrees[j].title);
                }
                degreesString = degArr.join(", ");
            }

            let industryString = "";
            if (a.employment_history) {
                let indArr = [];
                for (let k = 0; k < a.employment_history.length; k++) {
                    indArr.push(a.employment_history[k].company);
                }
                industryString = indArr.join(", ");
            }

            let rowData = [
                fullName,
                a.email,
                degreesString,
                industryString
            ];
            tableRows.push(rowData);
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save("alumni_report.pdf");
    }

    async function downloadChart() {
        if (chartRef.current !== null) {
            let canvas = await html2canvas(chartRef.current);
            let link = document.createElement('a');
            link.download = 'industry_chart.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }

    // Beginner-friendly: manual loop to calculate chart data
    let industriesCount = {};
    for (let i = 0; i < alumni.length; i++) {
        let a = alumni[i];
        
        let companyName = 'Unknown';
        if (a.employment_history && a.employment_history.length > 0) {
            if (a.employment_history[0].company) {
                companyName = a.employment_history[0].company;
            }
        } else {
            companyName = 'Unemployed';
        }
        
        if (industriesCount[companyName]) {
            industriesCount[companyName] = industriesCount[companyName] + 1;
        } else {
            industriesCount[companyName] = 1;
        }
    }
    
    // Convert object to arrays for Chart.js
    let chartLabels = [];
    let chartValues = [];
    for (let key in industriesCount) {
        chartLabels.push(key);
        chartValues.push(industriesCount[key]);
    }

    let chartData = {
        labels: chartLabels,
        datasets: [{
            data: chartValues,
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ]
        }]
    };

    // Helper functions for the HTML template
    function getDegreesString(a) {
        if (!a.degrees) {
            return "";
        }
        let arr = [];
        for (let i = 0; i < a.degrees.length; i++) {
            arr.push(a.degrees[i].title);
        }
        return arr.join(", ");
    }

    function getIndustryString(a) {
        if (!a.employment_history) {
            return "";
        }
        let arr = [];
        for (let i = 0; i < a.employment_history.length; i++) {
            arr.push(a.employment_history[i].company);
        }
        return arr.join(", ");
    }
    
    function getProfileImage(a) {
        if (a.profile_image) {
            return a.profile_image;
        } else {
            return "https://api.dicebear.com/7.x/avataaars/svg?seed=" + a.first_name;
        }
    }

    return (
        <main className="min-h-screen bg-surface pb-14 pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="font-headline text-4xl text-on-surface">Alumni Directory</h1>
                    <p className="text-secondary mt-2">Filter and generate reports for alumni.</p>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-label uppercase text-secondary mb-2">Programme</label>
                            <input 
                                type="text" 
                                name="programme" 
                                placeholder="e.g. BSc Computer Science" 
                                value={programme}
                                onChange={handleProgrammeChange}
                                className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-2 text-on-surface"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-label uppercase text-secondary mb-2">Graduation Year</label>
                            <input 
                                type="number" 
                                name="graduation_year" 
                                placeholder="e.g. 2022" 
                                value={graduationYear}
                                onChange={handleGraduationYearChange}
                                className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-2 text-on-surface"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-label uppercase text-secondary mb-2">Industry / Company</label>
                            <input 
                                type="text" 
                                name="industry" 
                                placeholder="e.g. Software, Google" 
                                value={industry}
                                onChange={handleIndustryChange}
                                className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-2 text-on-surface"
                            />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium shrink-0 h-[42px]">
                            Search
                        </button>
                    </form>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    <button onClick={exportCSV} disabled={alumni.length === 0} className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-xl bg-surface-container hover:bg-surface-variant transition disabled:opacity-50 text-on-surface">
                        <span className="material-symbols-outlined text-sm">csv</span> Export CSV
                    </button>
                    <button onClick={exportPDF} disabled={alumni.length === 0} className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-xl bg-surface-container hover:bg-surface-variant transition disabled:opacity-50 text-on-surface">
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Export PDF
                    </button>
                    <button onClick={downloadChart} disabled={alumni.length === 0} className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-xl bg-surface-container hover:bg-surface-variant transition disabled:opacity-50 text-on-surface">
                        <span className="material-symbols-outlined text-sm">image</span> Download Chart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 overflow-x-auto bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/30 bg-surface-container">
                                    <th className="p-4 text-xs font-label uppercase text-secondary">Name</th>
                                    <th className="p-4 text-xs font-label uppercase text-secondary">Email</th>
                                    <th className="p-4 text-xs font-label uppercase text-secondary">Degrees</th>
                                    <th className="p-4 text-xs font-label uppercase text-secondary">Company</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading === true ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-secondary">Loading...</td></tr>
                                ) : alumni.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-secondary">No alumni found.</td></tr>
                                ) : (
                                    alumni.map(function(a, i) {
                                        return (
                                            <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container/50">
                                                <td className="p-4 text-sm text-on-surface font-medium flex items-center gap-3">
                                                    <img src={getProfileImage(a)} alt="avatar" className="w-8 h-8 rounded-full border border-primary/20" />
                                                    {a.first_name} {a.second_name}
                                                </td>
                                                <td className="p-4 text-sm text-secondary">{a.email}</td>
                                                <td className="p-4 text-sm text-secondary truncate max-w-[200px]">
                                                    {getDegreesString(a)}
                                                </td>
                                                <td className="p-4 text-sm text-secondary truncate max-w-[200px]">
                                                    {getIndustryString(a)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-6 flex flex-col items-center">
                        <h3 className="font-headline text-lg mb-6 self-start text-on-surface">Industry Distribution</h3>
                        {alumni.length > 0 ? (
                            <div ref={chartRef} className="w-full max-w-[250px] aspect-square p-2 bg-surface-container-low">
                                <Pie data={chartData} options={{ responsive: true }} />
                            </div>
                        ) : (
                            <p className="text-secondary text-sm my-auto">No data to chart</p>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}

export default AlumniDirectory;

