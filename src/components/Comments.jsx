import React from "react";

const Comments = ({ comments }) => {
	return (
		<section
			className="comments-panel"
			style={{
				marginTop: "3rem",
				borderTop: "1px solid #eee",
				paddingTop: "2rem",
			}}
		>
			<header className="comments-header" style={{ marginBottom: "1.5rem" }}>
				<h2>Коментарі</h2>
				<div className="comments-meta">{comments.length} Коментарів</div>
			</header>

			{/* Форма для нового коментаря */}
			<div
				className="composer"
				style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}
			>
				<div
					className="avatar"
					style={{
						width: "40px",
						height: "40px",
						background: "var(--bg-input)",
						border: "1px solid var(--border-color)",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					S
				</div>
				<div className="composer-body" style={{ flex: 1 }}>
					<textarea
						id="newComment"
						placeholder="Приєднатися до обговорення…"
						rows="3"
						style={{
							width: "100%",
							padding: "0.5rem",
							borderRadius: "8px",
							background: "var(--bg-input)",
							color: "var(--text-main)",
							border: "1px solid var(--border-color)",
						}}
					></textarea>
					<div
						className="composer-controls"
						style={{
							display: "flex",
							justifyContent: "flex-end",
							gap: "1rem",
							marginTop: "0.5rem",
						}}
					>
						<button className="btn">Опублікувати</button>
					</div>
				</div>
			</div>

			{/* Список коментарів */}
			<ul className="comments-list" style={{ listStyle: "none", padding: 0 }}>
				{comments.map((comment) => (
					<li
						key={comment.id}
						style={{
							marginBottom: "1.5rem",
							background: "var(--bg-card)",
							border: "1px solid var(--border-color)",
							padding: "1rem",
							borderRadius: "8px",
						}}
					>
						<div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
							{comment.author.username}
						</div>
						<p style={{ margin: 0 }}>{comment.content}</p>
					</li>
				))}
			</ul>
		</section>
	);
};

export default Comments;
