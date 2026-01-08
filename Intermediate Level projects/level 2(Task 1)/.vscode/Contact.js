import React, { useState, useContext } from 'react';
import { AppContext } from './AppContext';

function Contact() {
	const { count, increment } = useContext(AppContext);
	const [form, setForm] = useState({ name: '', email: '', message: '' });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((s) => ({ ...s, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// simple feedback for demo purposes
		alert(`Thanks ${form.name || 'friend'} — we'll get back to you at ${form.email || 'your email'}.`);
		setForm({ name: '', email: '', message: '' });
		increment();
	};

	return (
		<div className="page">
			<h1>Contact Page</h1>
			<p>We'd love to hear from you — send a message below.</p>

			<div className="card">
				<form onSubmit={handleSubmit} aria-label="contact-form">
					<div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
						<label style={{ flex: '1 1 200px' }}>
							Name
							<input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 6, borderRadius:8, border: '1px solid rgba(255,255,255,0.06)', background:'transparent', color:'inherit' }} />
						</label>
						<label style={{ flex: '1 1 200px' }}>
							Email
							<input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 6, borderRadius:8, border: '1px solid rgba(255,255,255,0.06)', background:'transparent', color:'inherit' }} />
						</label>
					</div>

					<label style={{ display:'block', marginBottom:12 }}>
						Message
						<textarea name="message" value={form.message} onChange={handleChange} rows={5} style={{ width: '100%', padding: 10, marginTop:6, borderRadius:8, border: '1px solid rgba(255,255,255,0.06)', background:'transparent', color:'inherit' }} />
					</label>

					<div style={{ display:'flex', gap:12, alignItems:'center', marginTop:10 }}>
						<button type="submit">Send Message</button>
						<div style={{ color:'rgba(255,255,255,0.8)', fontWeight:600 }}>Shared Count: {count}</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Contact;
