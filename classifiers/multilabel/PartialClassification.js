var sprintf = require("sprintf").sprintf;
var _ = require("underscore")._;
var multilabelutils = require('./multilabelutils');

/**
 *  PartialClassification is a test classifier that learns and classifies the components
 * of the labels separately according to the splitLabel routine. One of the examples could be 
 * classifying intent, attribute, value separately by three different classifiers.
 * When performing test by trainAndTest module, there is a check for toFormat routine, if it exists
 * then pretest format converting occurs.
 *
 * @author Vasily Konovalov
 * @since March 2014
 */

var PartialClassification = function(opts) {
	
	opts = opts || {};
	if (!opts.multilabelClassifierType) {
		console.dir(opts);
		throw new Error("opts.multilabelClassifierType is null");
	}
	this.multilabelClassifierType = opts.multilabelClassifierType;
	this.splitLabel = opts.splitLabel || function(label)      {return label.split(/@/);}
	
	classifier = []
	_(3).times(function(n){ 
		 classif = new opts.multilabelClassifierType();
		classifier.push(classif);
 	});
	this.classifier = classifier
}

PartialClassification.prototype = {

	trainOnline: function(sample, labels) {
		throw new Error("PartialClassification does not support online training");
	},

	trainBatch : function(dataset) {
		num_of_classifiers = 0

		_.each(dataset, function(value, key, list){
			num_of_classifiers =  Math.max(num_of_classifiers, (value['output']).length)
		}, this);

			
		_(num_of_classifiers).times(function(n){
			data = []
			_.each(dataset, function(value, key, list){
				if (value.output.length - 1 >= n)
					{
						value1 = _.clone(value)
						value1['output'] = value.output[n]
						data.push(value1)
					}

			 },this)

			// classifier = new this.multilabelClassifierType();
			this.classifier[n].trainBatch(data)
			// classifier.trainBatch(data)
			// this.classifier.push(classifier)
			}, this)
	
	},

	classify: function(sample, explain, continuous_output) {
		explain = 0
		values = []
		
	 	_.each(this.classifier, function(classif, key, list){
	 		value = classif.classify(sample, explain) 
	 	 	if (value.length!=0) values.push(_.flatten(value))
	 	})

	 		return values
 	},


 	setFeatureLookupTable: function(featureLookupTable) {
 		_.each(this.classifier, function(classif, key, list){
	 		classif.setFeatureLookupTable(featureLookupTable)
	 	})
 	},
	
	getAllClasses: function() {
		throw new Error("No implementation in PartialClassification");
	},

	toJSON : function() {
		throw new Error("No implementation in PartialClassification");
	},

	fromJSON : function(json) {
		throw new Error("No implementation in PartialClassification");
	},
	
}

module.exports = PartialClassification;

