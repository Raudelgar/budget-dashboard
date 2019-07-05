const formatter = {
    format: function(v,o){
        let n = v;

        switch(o.type){
            case 'date':
                v = this.formatDate(v,o.moment);
                break;
            case 'nmbr':
                let c, d;

                d = this.formatNumberDecimals(n, o.decimal);
                c = this.formatNumberCommafy(n, o.commas);

                v = (o.pre ? '<pre>'+o.pre+'</pre>' : '') + c + d + (o.post ? '<post>'+o.post+'</post>' : '');
                break;
            case 'string':
                v = (o.pre ? '<pre>'+o.pre+'</pre>' : '') + v + (o.post ? '<post>'+o.post+'</post>' : '');
                break;
        }

        return v;
    },
    formatDate : function(timestamp, m){
        return moment(new Date(timestamp)).format(m);
    },
    formatNumberDecimals : function(v,d){
        d = String(v.toFixed(d)).split('.');
        return (d[1] ? '.' + d[1] : '');
    },
    formatNumberCommafy :  function(n, commas){
        return (commas ? Math.floor(n).toLocaleString() : String(Math.floor(n)));
    },
    convertToBillion : function(n){
        return Math.abs(Number(n))/1.0e+9;
    }
}