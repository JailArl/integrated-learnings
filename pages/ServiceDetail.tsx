import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Section, Button } from '../components/Components';
import { SERVICES } from '../constants';

export const ServiceDetail: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const service = SERVICES.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div>
        <PageHeader title="Service Not Found" subtitle="The service you're looking for doesn't exist." />
        <Section>
          <div className="text-center">
            <Button to="/tuition" className="px-8 py-3">Back to Services</Button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={service.title} subtitle={service.description} />
      
      <Section className="bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-4xl mx-auto">
          <img src={service.image} alt={service.title} loading="lazy" decoding="async" className="w-full h-80 object-cover rounded-2xl shadow-lg mb-12" />
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">About This Service</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-4">
                {service.description}
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our expert educators are specifically trained to help students excel in {service.title.toLowerCase()}. 
                We provide personalized guidance, strategic planning, and continuous support throughout the process.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-200">
              <h3 className="text-2xl font-bold text-primary mb-6">Get Started</h3>
              <p className="text-slate-700 mb-6">
                Tell us about your child's needs for {service.title.toLowerCase()} and we'll recommend the right learning pathway — no account needed.
              </p>
              <Button to="/tuition#parent-inquiry" className="w-full mb-4">
                Get Learning Assessment
              </Button>
              <p className="text-xs text-slate-500 text-center">Free — no signup required</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-slate-200 mb-12">
            <h3 className="text-2xl font-bold text-primary mb-6">Why Choose Our {service.title}?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="text-2xl text-secondary flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Expert-Led Diagnostics</h4>
                  <p className="text-slate-600">Our diagnostic assessment identifies your child's specific needs and learning style.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-secondary flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Verified Educators</h4>
                  <p className="text-slate-600">Hand-selected professionals with proven success in this service area.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-secondary flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Personalized Plans</h4>
                  <p className="text-slate-600">Tailored strategies aligned with Singapore's education framework.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl text-secondary flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Continuous Support</h4>
                  <p className="text-slate-600">Progress tracking, regular updates, and flexible adjustments throughout.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Begin?</h3>
            <p className="mb-6 text-blue-100">
              Join hundreds of Singapore families who've found success through diagnostic-driven education.
            </p>
            <Button to="/tuition#parent-inquiry" variant="white" className="px-10 py-3 text-lg font-bold">
              Get Learning Assessment
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ServiceDetail;
