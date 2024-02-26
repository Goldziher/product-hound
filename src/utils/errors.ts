export class ApiError extends Error {
	readonly statusCode: number;
	readonly statusText: string;
	readonly context?: Record<string, any>;

	constructor(
		msg: string,
		{
			statusCode,
			statusText,
			context,
		}: {
			context?: Record<string, any>;
			statusCode: number;
			statusText: string;
		},
	) {
		super(msg);
		Object.setPrototypeOf(this, ApiError.prototype);
		this.name = 'ApiError';

		this.statusCode = statusCode;
		this.statusText = statusText;
		this.context = context;
	}
}

export class PermissionError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, PermissionError.prototype);
		this.name = 'PermissionError';
	}
}

export class ConfigurationError extends Error {
	readonly context?: Record<string, any>;
	constructor(
		msg: string,
		context: Record<string, any> | undefined = undefined,
	) {
		super(msg);
		Object.setPrototypeOf(this, ConfigurationError.prototype);
		this.name = 'ConfigurationError';

		this.context = context;
	}
}

export class RuntimeError extends Error {
	readonly context?: Record<string, any>;
	constructor(
		msg: string,
		context: Record<string, any> | undefined = undefined,
	) {
		super(msg);
		Object.setPrototypeOf(this, ConfigurationError.prototype);
		this.name = 'RuntimeError';

		this.context = context;
	}
}
