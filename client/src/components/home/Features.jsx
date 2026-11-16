
import { Zap, Sparkles, FileText, Download } from 'lucide-react';
import React from 'react'
import Title from './Title';

const Features = () => {
    const [isHover, setIsHover] = React.useState(false);

    return (
        <div id='features' className='flex flex-col items-center my-10 scroll-mt-12'>

            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-400/10 rounded-full px-6 py-1.5">
                <Zap width={14} />
                <span>Simple Process</span>
            </div>

            <Title
                title='Build your resume'
                description='Our streamlined process helps you create a professional resume in minutes with intelligent AI-powered tools and features.'
            />

            <div className="flex flex-col md:flex-row items-center justify-center xl:-mt-10">

                <img
                    className="max-w-2xl w-full xl:-ml-32"
                    src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png"
                    alt="Resume building process"
                />

                <div
                    className="px-4 md:px-0"
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                >

                    {/* Feature 1 */}
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className={`p-6 group-hover:bg-violet-100 border border-transparent group-hover:border-violet-300 flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-violet-300 bg-violet-100' : ''}`}>
                            <Sparkles className="size-6 shrink-0 stroke-violet-600" />

                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">
                                    AI-Powered Content Enhancement
                                </h3>
                                <p className="text-sm text-slate-600 max-w-xs">
                                    Generate professional summaries and improve your resume descriptions with intelligent AI-powered suggestions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-green-100 border border-transparent group-hover:border-green-300 flex gap-4 rounded-xl transition-colors">
                            <FileText className="size-6 shrink-0 stroke-green-600" />

                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">
                                    Professional Resume Templates
                                </h3>
                                <p className="text-sm text-slate-600 max-w-xs">
                                    Choose from professionally designed templates and customize your resume to match your career goals.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-orange-100 border border-transparent group-hover:border-orange-300 flex gap-4 rounded-xl transition-colors">
                            <Download className="size-6 shrink-0 stroke-orange-600" />

                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">
                                    Easy Editing & Download
                                </h3>
                                <p className="text-sm text-slate-600 max-w-xs">
                                    Create, edit, and preview your resumes effortlessly, then download your polished resume whenever you need it.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>

        </div>
    )
}

export default Features
